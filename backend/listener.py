import json
import requests
import time
import os
from web3 import Web3
from dotenv import load_dotenv

# ===============================
# LOAD ENVIRONMENT VARIABLES
# ===============================
load_dotenv()

# ===============================
# CONFIG from .env
# ===============================
RPC_URL = os.getenv("RPC_URL", "http://127.0.0.1:8545")
COMMERCE_ADDRESS = os.getenv("COMMERCE_ADDRESS", "0x78c37Dcb5C3C072DAfb9D4e28638BBcdf297FeeB")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
AI_URL = os.getenv("AI_URL", "http://127.0.0.1:8000/risk")
COMMERCE_ABI_PATH = os.getenv("COMMERCE_ABI_PATH", "../artifacts/contracts/core/CommerceCore.sol/CommerceCore.json")
LISTENER_INTERVAL = int(os.getenv("LISTENER_INTERVAL", "2"))
GAS_LIMIT = int(os.getenv("GAS_LIMIT", "200000"))
GAS_PRICE_GWEI = int(os.getenv("GAS_PRICE_GWEI", "1"))

# ===============================
# VALIDATE REQUIRED CONFIG
# ===============================
if not PRIVATE_KEY:
    print("❌ PRIVATE_KEY not found in .env file!")
    print("Please add PRIVATE_KEY=your_private_key to .env file")
    exit(1)

# ===============================
# LOAD ABI
# ===============================
try:
    with open(COMMERCE_ABI_PATH) as f:
        abi = json.load(f)["abi"]
    print(f"✅ ABI loaded from {COMMERCE_ABI_PATH}")
except FileNotFoundError:
    print(f"❌ ABI file not found at {COMMERCE_ABI_PATH}")
    print("Please check COMMERCE_ABI_PATH in .env file")
    exit(1)
except Exception as e:
    print(f"❌ Error loading ABI: {e}")
    exit(1)

# ===============================
# WEB3 INIT
# ===============================
w3 = Web3(Web3.HTTPProvider(RPC_URL))

if not w3.is_connected():
    print(f"❌ Failed to connect to blockchain at {RPC_URL}")
    print("Please check RPC_URL in .env file")
    exit(1)

# Get chain ID from network
chain_id = w3.eth.chain_id
print(f"✅ Connected to chain ID: {chain_id}")
print(f"✅ RPC URL: {RPC_URL}")

# Setup account from private key
try:
    account = w3.eth.account.from_key(PRIVATE_KEY)
    print(f"✅ Listener account: {account.address}")
except Exception as e:
    print(f"❌ Invalid private key: {e}")
    exit(1)

# Initialize contract
contract = w3.eth.contract(
    address=COMMERCE_ADDRESS,
    abi=abi
)
print(f"✅ Contract initialized at {COMMERCE_ADDRESS}")

# ===============================
# EVENT FILTER
# ===============================
current_block = w3.eth.block_number
print(f"📦 Current block: {current_block}")

event_filter = contract.events.OrderCreated.create_filter(
    from_block=current_block
)

print("🚀 Listening for OrderCreated events...")
print("=" * 50)

# ===============================
# HELPER FUNCTIONS
# ===============================
def get_product_type_name(product_type_enum):
    """Convert product type enum to string"""
    return "DIGITAL" if product_type_enum == 0 else "PHYSICAL" if product_type_enum == 1 else f"UNKNOWN({product_type_enum})"

def get_status_name(status_enum):
    """Convert status enum to string"""
    status_names = {
        0: "ESCROW_HOLD", 
        1: "REFUND_REQUESTED", 
        2: "DISPUTED",
        3: "COMPLETED", 
        4: "REFUNDED", 
        5: "CANCELLED"
    }
    return status_names.get(status_enum, f"UNKNOWN({status_enum})")

def send_transaction(tx_func, *args, nonce=None, description=""):
    """
    Helper function to send transactions with proper error handling
    """
    try:
        if nonce is None:
            nonce = w3.eth.get_transaction_count(account.address, "pending")
        
        # Build transaction
        tx = tx_func(*args).build_transaction({
            "from": account.address,
            "nonce": nonce,
            "gas": GAS_LIMIT,
            "gasPrice": w3.to_wei(GAS_PRICE_GWEI, "gwei"),
            "chainId": chain_id
        })
        
        # Sign and send
        signed_tx = account.sign_transaction(tx)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        
        print(f"   📤 Transaction sent: {tx_hash.hex()}")
        
        # Wait for receipt
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=30)
        
        if receipt['status'] == 1:
            print(f"   ✅ {description} successful: {tx_hash.hex()}")
            return receipt, nonce + 1
        else:
            print(f"   ❌ {description} failed (transaction reverted)")
            return None, nonce
            
    except Exception as e:
        print(f"   ❌ {description} failed: {e}")
        return None, nonce

# ===============================
# MAIN LOOP
# ===============================
print(f"🔄 Listener running (checking every {LISTENER_INTERVAL} seconds)...")
print("Press Ctrl+C to stop\n")

while True:
    try:
        events = event_filter.get_new_entries()
        
        if events:
            print(f"\n🔔 Found {len(events)} new event(s) at {time.strftime('%Y-%m-%d %H:%M:%S')}")

        for event in events:
            order_id = event['args']['id']
            buyer = event['args']['buyer']
            seller = event['args']['seller']

            print(f"\n{'='*60}")
            print(f"📦 New Order Detected: #{order_id}")
            print(f"   Buyer: {buyer[:10]}...{buyer[-8:]}")
            print(f"   Seller: {seller[:10]}...{seller[-8:]}")

            # Get order details
            try:
                order = contract.functions.orders(order_id).call()
                
                amount = order[3]
                product_type = order[4]
                status = order[5]
                current_risk = order[7]

                product_type_name = get_product_type_name(product_type)
                status_name = get_status_name(status)

                print(f"   Amount: {amount / 1e6} USDC")
                print(f"   Product Type: {product_type_name}")
                print(f"   Current Status: {status_name}")
                print(f"   Current Risk Score: {current_risk}")

                # Skip if already completed
                if status != 0:
                    print(f"⏭️  Order not in ESCROW_HOLD, skipping...")
                    continue
                
            except Exception as e:
                print(f"❌ Error fetching order details: {e}")
                continue

            # AI Risk Assessment
            tx_data = {
                "Time": 0,
                "Amount": float(amount / 1e6),
                "V1":0,"V2":0,"V3":0,"V4":0,"V5":0,"V6":0,"V7":0,
                "V8":0,"V9":0,"V10":0,"V11":0,"V12":0,"V13":0,"V14":0,
                "V15":0,"V16":0,"V17":0,"V18":0,"V19":0,"V20":0,
                "V21":0,"V22":0,"V23":0,"V24":0,"V25":0,"V26":0,"V27":0,"V28":0
            }

            try:
                print(f"   🤖 Calling AI service at {AI_URL}...")
                res = requests.post(AI_URL, json=tx_data, timeout=10)
                
                if res.status_code != 200:
                    print(f"❌ AI Error: {res.text}")
                    continue

                risk_data = res.json()
                risk_score = risk_data["risk_score"]
                print(f"   🤖 AI Risk Score: {risk_score}/100")

            except requests.exceptions.ConnectionError:
                print(f"❌ AI Service not reachable at {AI_URL}")
                print("   Make sure your FastAPI backend is running")
                continue
            except Exception as e:
                print(f"❌ AI Call Failed: {e}")
                continue

            # Get current nonce
            nonce = w3.eth.get_transaction_count(account.address, "pending")
            print(f"   📍 Current nonce: {nonce}")

            # ===============================
            # Set Risk Score
            # ===============================
            receipt, nonce = send_transaction(
                contract.functions.setRiskScore,
                order_id,
                risk_score,
                nonce=nonce,
                description="Risk Score Update"
            )

            if not receipt:
                print(f"❌ Failed to update risk score for order #{order_id}")
                continue

            # ===============================
            # Auto Approve for Digital Products (Low Risk)
            # ===============================
            if product_type == 1:  # PHYSICAL
                print(f"   📦 PHYSICAL product - Manual approval required")
                print(f"   ℹ️  Admin can approve/reject in admin panel")
                continue

            if product_type == 0:  # DIGITAL
                if risk_score < 70:  # Low risk
                    print(f"   🟢 LOW RISK DIGITAL → Auto approving...")
                    
                    receipt, nonce = send_transaction(
                        contract.functions.adminApprove,
                        order_id,
                        nonce=nonce,
                        description="Auto Approval"
                    )
                    
                    if receipt:
                        print(f"   ✅ ESCROW RELEASED automatically!")
                    else:
                        print(f"   ❌ Auto approval failed")
                        
                else:  # High risk
                    print(f"   🔴 HIGH RISK DIGITAL ({risk_score}/100)")
                    print(f"   ℹ️  Manual review required in admin panel")

            print(f"{'='*60}\n")

    except KeyboardInterrupt:
        print("\n\n👋 Listener stopped by user")
        break
    except Exception as e:
        print(f"⚠️ Listener Error: {e}")
        import traceback
        traceback.print_exc()

    time.sleep(LISTENER_INTERVAL)