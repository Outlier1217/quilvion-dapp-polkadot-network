from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import psycopg2
import os
import random
import string
import shutil
import uuid
from dotenv import load_dotenv
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from fastapi import UploadFile, File
ADMIN_WALLET = "0xAb06a17af1425F499E302B639c69f8ce29a967E0"

load_dotenv()

app = FastAPI()
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# -----------------------------
# CORS (Frontend access)
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # production me domain restrict karna
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Load AI Model
# -----------------------------
model = joblib.load("fraud_model.pkl")

# -----------------------------
# Database Connection
# -----------------------------
DB_URL = os.getenv("DATABASE_URL")

def get_conn():
    return psycopg2.connect(DB_URL)

# -----------------------------
# Utility
# -----------------------------
def generate_username():
    return "user_" + ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))


# ============================================================
# 🔥 1️⃣ AI RISK ENDPOINT
# ============================================================

class Transaction(BaseModel):
    Time: float
    Amount: float
    V1: float
    V2: float
    V3: float
    V4: float
    V5: float
    V6: float
    V7: float
    V8: float
    V9: float
    V10: float
    V11: float
    V12: float
    V13: float
    V14: float
    V15: float
    V16: float
    V17: float
    V18: float
    V19: float
    V20: float
    V21: float
    V22: float
    V23: float
    V24: float
    V25: float
    V26: float
    V27: float
    V28: float


@app.post("/risk")
def calculate_risk(tx: Transaction):

    feature_order = [
        'Time','V1','V2','V3','V4','V5','V6','V7','V8','V9',
        'V10','V11','V12','V13','V14','V15','V16','V17','V18','V19',
        'V20','V21','V22','V23','V24','V25','V26','V27','V28','Amount'
    ]

    df = pd.DataFrame([tx.dict()])
    df = df[feature_order]

    prob = model.predict_proba(df)[0][1]
    risk_score = int(prob * 100)

    return {
        "risk_score": risk_score,
        "probability": float(prob)
    }



# ============================================================
# 🔐 2️⃣ CONNECT WALLET
# ============================================================

# 🔐 2️⃣ CONNECT WALLET

class WalletRequest(BaseModel):
    wallet_address: str


@app.post("/connect-wallet")
def connect_wallet(data: WalletRequest):

    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        "SELECT username, profile_image FROM users WHERE wallet_address = %s",
        (data.wallet_address,)
    )

    user = cur.fetchone()

    if user:
        cur.close()
        conn.close()
        return {
            "username": user[0],
            "profile_image": user[1]
        }

    username = generate_username()

    while True:
        cur.execute("SELECT 1 FROM users WHERE username = %s", (username,))
        if not cur.fetchone():
            break
        username = generate_username()

    cur.execute(
        "INSERT INTO users (wallet_address, username) VALUES (%s, %s)",
        (data.wallet_address, username)
    )

    conn.commit()
    cur.close()
    conn.close()

    return {"username": username}

# ============================================================
# 📝 3️⃣ UPDATE USERNAME
# ============================================================

class UsernameUpdate(BaseModel):
    wallet_address: str
    new_username: str


@app.post("/update-username")
def update_username(data: UsernameUpdate):

    conn = get_conn()
    cur = conn.cursor()

    cur.execute("SELECT 1 FROM users WHERE username = %s", (data.new_username,))
    if cur.fetchone():
        raise HTTPException(status_code=400, detail="Username already taken")

    cur.execute(
        "UPDATE users SET username = %s WHERE wallet_address = %s",
        (data.new_username, data.wallet_address)
    )

    conn.commit()
    cur.close()
    conn.close()

    return {"message": "Username updated"}


# ============================================================
# 🧑‍💼 4️⃣ REGISTER MERCHANT
# ============================================================

class MerchantRegister(BaseModel):
    wallet_address: str
    name: str
    company_name: str
    address: str
    email: str
    product_type: str


@app.post("/register-merchant")
def register_merchant(data: MerchantRegister):

    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        """INSERT INTO merchants 
        (wallet_address, name, company_name, address, email, product_type)
        VALUES (%s,%s,%s,%s,%s,%s)""",
        (
            data.wallet_address,
            data.name,
            data.company_name,
            data.address,
            data.email,
            data.product_type
        )
    )

    conn.commit()
    cur.close()
    conn.close()

    return {
        "message": "Registration successful. Wait for admin approval."
    }

@app.get("/pending-merchants")
def pending_merchants():
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("SELECT wallet_address, name, company_name FROM merchants WHERE approved = FALSE")
    data = cur.fetchall()

    cur.close()
    conn.close()

    return data

class ApproveRequest(BaseModel):
    admin_wallet: str
    merchant_wallet: str
    
@app.post("/approve-merchant")
def approve_merchant(data: ApproveRequest):
    print(f"\n🔍 ===== APPROVE MERCHANT =====")
    print(f"Admin wallet from request: {data.admin_wallet}")
    print(f"ADMIN_WALLET from env: {ADMIN_WALLET}")
    print(f"Lowercase request: {data.admin_wallet.lower()}")
    print(f"Lowercase env: {ADMIN_WALLET.lower()}")
    print(f"Equal? {data.admin_wallet.lower() == ADMIN_WALLET.lower()}")
    
    if data.admin_wallet.lower() != ADMIN_WALLET.lower():
        print(f"❌ Unauthorized! {data.admin_wallet.lower()} != {ADMIN_WALLET.lower()}")
        raise HTTPException(status_code=403, detail="Not authorized")

    conn = get_conn()
    cur = conn.cursor()

    # Approve merchant
    cur.execute(
        "UPDATE merchants SET approved = TRUE WHERE wallet_address = %s",
        (data.merchant_wallet,)
    )

    # Approve all products of that merchant
    cur.execute(
        "UPDATE products SET approved = TRUE WHERE wallet_address = %s",
        (data.merchant_wallet,)
    )

    conn.commit()
    cur.close()
    conn.close()

    return {"message": "Merchant and products approved"}

@app.post("/reject-merchant")
def reject_merchant(data: ApproveRequest):

    if data.admin_wallet.lower() != ADMIN_WALLET:
        raise HTTPException(status_code=403, detail="Not authorized")

    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        "DELETE FROM merchants WHERE wallet_address = %s",
        (data.merchant_wallet,)
    )

    conn.commit()
    cur.close()
    conn.close()

    return {"message": "Merchant rejected"}

@app.get("/merchant-status/{wallet_address}")
def merchant_status(wallet_address: str):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        "SELECT approved FROM merchants WHERE wallet_address = %s",
        (wallet_address,)
    )

    result = cur.fetchone()

    cur.close()
    conn.close()

    if not result:
        return {"is_merchant": False, "approved": False}

    return {"is_merchant": True, "approved": result[0]}


# ============================================================
# 🛍 5️⃣ ADD PRODUCT
# ============================================================

class ProductCreate(BaseModel):
    wallet_address: str
    title: str
    description: str
    image_url: str
    price: float
    product_type: str
    download_link: str | None = None

    

@app.post("/add-product")
def add_product(data: ProductCreate):

    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        "SELECT approved FROM merchants WHERE wallet_address = %s",
        (data.wallet_address,)
    )

    merchant = cur.fetchone()

    if not merchant:
        raise HTTPException(status_code=403, detail="Merchant not registered")

    download_link = data.download_link if data.product_type == "DIGITAL" else None

    cur.execute(
        """
        INSERT INTO products
        (wallet_address,title,description,image_url,price,product_type,download_link)
        VALUES (%s,%s,%s,%s,%s,%s,%s)
        """,
        (
            data.wallet_address,
            data.title,
            data.description,
            data.image_url,
            data.price,
            data.product_type,
            download_link
        )
    )

    conn.commit()
    cur.close()
    conn.close()

    return {"message": "Product submitted"}

# ============================================================
# 🏠 6️⃣ GET PRODUCTS (Filter + Search)
# ============================================================

@app.get("/products")
def get_products(
    search: str = Query(None),
    product_type: str = Query(None)
):

    conn = get_conn()
    cur = conn.cursor()

    query = """
    SELECT p.id, p.title, p.description, p.image_url, p.price, p.product_type,
           u.username, u.wallet_address
    FROM products p
    JOIN users u ON p.wallet_address = u.wallet_address
    WHERE p.approved = TRUE
    """

    params = []

    if search:
        query += " AND p.title ILIKE %s"
        params.append(f"%{search}%")

    if product_type:
        query += " AND p.product_type = %s"
        params.append(product_type)

    cur.execute(query, tuple(params))
    products = cur.fetchall()

    cur.close()
    conn.close()

    return products


@app.get("/seller-products/{wallet}")
def seller_products(wallet: str):

    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT id,title,image_url,price,product_type
        FROM products
        WHERE wallet_address = %s AND approved = TRUE
        """,
        (wallet,)
    )

    data = cur.fetchall()

    cur.close()
    conn.close()

    return data

@app.get("/pending-products")
def pending_products():

    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
    SELECT id,title,price,product_type,wallet_address
    FROM products
    WHERE approved = FALSE
    """)

    data = cur.fetchall()

    cur.close()
    conn.close()

    return data


@app.post("/approve-product")
def approve_product(product_id: int, admin_wallet: str):
    print(f"\n🔍 ===== APPROVE PRODUCT =====")
    print(f"Admin wallet from request: {admin_wallet}")
    print(f"ADMIN_WALLET from env: {ADMIN_WALLET}")
    print(f"Lowercase request: {admin_wallet.lower()}")
    print(f"Lowercase env: {ADMIN_WALLET.lower()}")
    print(f"Equal? {admin_wallet.lower() == ADMIN_WALLET.lower()}")
    
    if admin_wallet.lower() != ADMIN_WALLET.lower():
        print(f"❌ Unauthorized! {admin_wallet.lower()} != {ADMIN_WALLET.lower()}")
        raise HTTPException(status_code=403, detail="Not authorized")

    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        "UPDATE products SET approved = TRUE WHERE id = %s",
        (product_id,)
    )

    conn.commit()
    cur.close()
    conn.close()

    print(f"✅ Product {product_id} approved successfully")
    return {"message": "Product approved"}



@app.post("/reject-product")
def reject_product(product_id: int, admin_wallet: str):
    print(f"\n🔍 ===== REJECT PRODUCT =====")
    print(f"Admin wallet from request: {admin_wallet}")
    print(f"ADMIN_WALLET from env: {ADMIN_WALLET}")
    print(f"Lowercase request: {admin_wallet.lower()}")
    print(f"Lowercase env: {ADMIN_WALLET.lower()}")
    print(f"Equal? {admin_wallet.lower() == ADMIN_WALLET.lower()}")
    
    if admin_wallet.lower() != ADMIN_WALLET.lower():
        print(f"❌ Unauthorized! {admin_wallet.lower()} != {ADMIN_WALLET.lower()}")
        raise HTTPException(status_code=403, detail="Not authorized")

    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        "DELETE FROM products WHERE id = %s",
        (product_id,)
    )

    conn.commit()
    cur.close()
    conn.close()

    print(f"✅ Product {product_id} rejected and deleted")
    return {"message": "Product rejected"}


# ============================================================
# 📦 7️⃣ GET USER ORDERS
# ============================================================

@app.get("/orders/{wallet_address}")
def get_orders(wallet_address: str):

    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
    SELECT 
        o.order_id_onchain,
        o.seller_wallet,
        o.status,
        o.risk_score,
        p.title,
        p.description,
        p.price,
        p.product_type,
        p.download_link
    FROM orders o
    JOIN products p
    ON o.product_id = p.id
    WHERE o.buyer_wallet = %s
    ORDER BY o.created_at DESC
    """,(wallet_address,))

    orders = cur.fetchall()

    cur.close()
    conn.close()

    return orders

class OrderCreate(BaseModel):
    order_id_onchain: int
    buyer_wallet: str
    seller_wallet: str
    product_id: int
    tx_hash: str
    status: str

    class Config:
        arbitrary_types_allowed = True


@app.post("/save-order")
def save_order(data: OrderCreate):

    try:

        conn = get_conn()
        cur = conn.cursor()

        cur.execute(
            """
            INSERT INTO orders
            (order_id_onchain,buyer_wallet,seller_wallet,product_id,status,tx_hash,risk_score)
            VALUES (%s,%s,%s,%s,%s,%s,%s)
            """,
            (
                data.order_id_onchain,
                data.buyer_wallet,
                data.seller_wallet,
                data.product_id,
                data.status,
                data.tx_hash,
                0
            )
        )

        conn.commit()

        cur.close()
        conn.close()

        return {"message": "Order stored"}

    except Exception as e:

        print("SAVE ORDER ERROR:", e)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.get("/order-product/{order_id}")
def order_product(order_id:int):

    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT p.download_link
        FROM orders o
        JOIN products p
        ON o.product_id = p.id
        WHERE o.order_id_onchain = %s
        """,
        (order_id,)
    )

    data = cur.fetchone()

    cur.close()
    conn.close()

    return data


@app.get("/escrow-orders")
def escrow_orders():

    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
    SELECT id,order_id_onchain,buyer_wallet,seller_wallet,product_id,status
    FROM orders
    WHERE status = 'ESCROW_HOLD'
    """)

    data = cur.fetchall()

    cur.close()
    conn.close()

    return data

class EscrowDecision(BaseModel):
    order_id: int
    admin_wallet: str
    action: str


# main.py - Line ~340
@app.post("/admin-order-decision")
def admin_order_decision(data: EscrowDecision):
    print(f"\n🔍 ===== ADMIN ORDER DECISION =====")
    print(f"Admin wallet from request: {data.admin_wallet}")
    print(f"ADMIN_WALLET from env: {ADMIN_WALLET}")
    print(f"Lowercase compare: {data.admin_wallet.lower()} == {ADMIN_WALLET.lower()}?")
    print(f"Action: {data.action}")
    print(f"Order ID: {data.order_id}")
    
    # Authorization check
    if data.admin_wallet.lower() != ADMIN_WALLET.lower():
        print(f"❌ Unauthorized! {data.admin_wallet.lower()} != {ADMIN_WALLET.lower()}")
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        conn = get_conn()
        cur = conn.cursor()
        
        # Pehle check karo order exists karta hai?
        cur.execute("SELECT id, status FROM orders WHERE id = %s", (data.order_id,))
        order = cur.fetchone()
        
        if not order:
            print(f"❌ Order ID {data.order_id} not found in database!")
            raise HTTPException(status_code=404, detail="Order not found")
        
        print(f"Current order status: {order[1]}")
        
        # Update status
        new_status = "COMPLETED" if data.action == "APPROVE" else "CANCELLED"
        cur.execute(
            "UPDATE orders SET status = %s WHERE id = %s",
            (new_status, data.order_id)
        )
        
        # Check if update was successful
        if cur.rowcount == 0:
            print(f"❌ No rows updated for order ID {data.order_id}")
            raise HTTPException(status_code=404, detail="Order not updated")
        
        conn.commit()
        print(f"✅ Order {data.order_id} status updated to {new_status}")
        
        # Verify update
        cur.execute("SELECT status FROM orders WHERE id = %s", (data.order_id,))
        updated = cur.fetchone()
        print(f"Verified new status: {updated[0]}")
        
        cur.close()
        conn.close()
        
        return {"message": f"Order {data.order_id} {new_status}"}
        
    except psycopg2.Error as e:
        print(f"❌ Database error: {e}")
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/platform-settings")
def get_platform_settings():

    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
    SELECT daily_limit,admin_threshold,platform_fee_bps
    FROM platform_settings
    ORDER BY id DESC
    LIMIT 1
    """)

    data = cur.fetchone()

    cur.close()
    conn.close()

    return {
        "daily_limit": float(data[0]),
        "admin_threshold": float(data[1]),
        "platform_fee_bps": int(data[2])
    }


class PlatformSettings(BaseModel):
    admin_wallet:str
    daily_limit:float
    admin_threshold:float
    platform_fee_bps:int


@app.post("/update-platform-settings")
def update_platform_settings(data: PlatformSettings):
    print(f"\n🔍 ===== UPDATE PLATFORM SETTINGS =====")
    print(f"Admin wallet from request: {data.admin_wallet}")
    print(f"ADMIN_WALLET from env: {ADMIN_WALLET}")
    print(f"Lowercase request: {data.admin_wallet.lower()}")
    print(f"Lowercase env: {ADMIN_WALLET.lower()}")
    print(f"Equal? {data.admin_wallet.lower() == ADMIN_WALLET.lower()}")
    
    if data.admin_wallet.lower() != ADMIN_WALLET.lower():
        print(f"❌ Unauthorized! {data.admin_wallet.lower()} != {ADMIN_WALLET.lower()}")
        raise HTTPException(status_code=403, detail="Not authorized")

    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
    UPDATE platform_settings
    SET daily_limit=%s,
        admin_threshold=%s,
        platform_fee_bps=%s,
        updated_at=NOW()
    WHERE id=1
    """,
    (
        data.daily_limit,
        data.admin_threshold,
        data.platform_fee_bps
    ))

    conn.commit()
    cur.close()
    conn.close()

    print(f"✅ Platform settings updated")
    return {"message": "Platform settings updated"}


class MessageCreate(BaseModel):
    sender_wallet: str
    receiver_wallet: str
    message: str


@app.post("/send-message")
def send_message(data: MessageCreate):

    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO messages (sender_wallet,receiver_wallet,message)
        VALUES (%s,%s,%s)
        """,
        (data.sender_wallet,data.receiver_wallet,data.message)
    )

    conn.commit()

    cur.close()
    conn.close()

    return {"message":"sent"}

@app.get("/messages/{wallet}")
def get_messages(wallet: str):

    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
        SELECT sender_wallet,message,created_at
        FROM messages
        WHERE receiver_wallet=%s
        ORDER BY created_at DESC
    """,(wallet,))

    data = cur.fetchall()

    cur.close()
    conn.close()

    return data

@app.get("/unread/{wallet}")
def unread(wallet:str):

    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
        SELECT COUNT(DISTINCT sender_wallet)
        FROM messages
        WHERE receiver_wallet=%s
        AND is_read=FALSE
    """,(wallet,))

    count = cur.fetchone()[0]

    cur.close()
    conn.close()

    return {"count":count}


@app.get("/conversations/{wallet}")
def conversations(wallet:str):

    conn=get_conn()
    cur=conn.cursor()

    cur.execute("""
    SELECT DISTINCT
    CASE
        WHEN sender_wallet=%s THEN receiver_wallet
        ELSE sender_wallet
    END as user_wallet
    FROM messages
    WHERE sender_wallet=%s OR receiver_wallet=%s
    """,(wallet,wallet,wallet))

    data=cur.fetchall()

    cur.close()
    conn.close()

    return data


@app.get("/chat/{wallet1}/{wallet2}")
def chat(wallet1:str,wallet2:str):

    conn=get_conn()
    cur=conn.cursor()

    cur.execute("""
    SELECT sender_wallet,message,created_at
    FROM messages
    WHERE
    (sender_wallet=%s AND receiver_wallet=%s)
    OR
    (sender_wallet=%s AND receiver_wallet=%s)
    ORDER BY created_at ASC
    """,(wallet1,wallet2,wallet2,wallet1))

    data=cur.fetchall()

    cur.close()
    conn.close()

    return data


@app.post("/mark-read/{wallet}")
def mark_read(wallet:str):

    conn=get_conn()
    cur=conn.cursor()

    cur.execute("""
    UPDATE messages
    SET is_read=TRUE
    WHERE receiver_wallet=%s
    """,(wallet,))

    conn.commit()

    cur.close()
    conn.close()

    return {"status":"ok"}


@app.get("/unread/{wallet}")
def unread(wallet:str):

    conn=get_conn()
    cur=conn.cursor()

    cur.execute("""
    SELECT COUNT(DISTINCT sender_wallet)
    FROM messages
    WHERE receiver_wallet=%s
    AND is_read=FALSE
    """,(wallet,))

    count=cur.fetchone()[0]

    cur.close()
    conn.close()

    return {"count":count}

@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):

    filename = f"{uuid.uuid4()}_{file.filename}"

    path = f"uploads/{filename}"

    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "image_url": f"http://localhost:8000/uploads/{filename}"
    }


class SupportMessage(BaseModel):
    sender_wallet: str | None = None
    sender_name: str | None = None
    seller_wallet: str | None = None
    message: str



@app.post("/support")
def support_message(data: SupportMessage):

    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO support_messages
        (sender_wallet, sender_name, seller_wallet, message)
        VALUES (%s,%s,%s,%s)
        """,
        (
            data.sender_wallet,
            data.sender_name,
            data.seller_wallet,
            data.message
        )
    )

    conn.commit()

    cur.close()
    conn.close()

    return {"message":"Support message received"}

@app.get("/my-products/{wallet}")
def my_products(wallet: str):

    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
    SELECT id,title,description,image_url,price,product_type,download_link
    FROM products
    WHERE wallet_address = %s
    """,(wallet,))

    data = cur.fetchall()

    cur.close()
    conn.close()

    return data

@app.get("/total-orders/{wallet}")
def total_orders(wallet:str):

    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
    SELECT COALESCE(SUM(p.price),0)
    FROM orders o
    JOIN products p ON o.product_id = p.id
    WHERE o.buyer_wallet = %s
    """,(wallet,))

    total = cur.fetchone()[0]

    cur.close()
    conn.close()

    return {"total": float(total)}

@app.get("/total-sales/{wallet}")
def total_sales(wallet:str):

    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
    SELECT COALESCE(SUM(p.price),0)
    FROM orders o
    JOIN products p ON o.product_id = p.id
    WHERE o.seller_wallet = %s
    AND o.status = 'COMPLETED'
    """,(wallet,))

    total = cur.fetchone()[0]

    cur.close()
    conn.close()

    return {"total": float(total)}

@app.get("/admin/users")
def admin_users():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT wallet_address, username, created_at FROM users ORDER BY created_at DESC")
    data = cur.fetchall()
    cur.close()
    conn.close()
    
    return [
        {
            "wallet_address": row[0],
            "username": row[1],
            "created_at": row[2].isoformat() if row[2] else None
        }
        for row in data
    ]

@app.get("/admin/merchants")
def admin_merchants():
    conn = get_conn()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT 
            m.wallet_address, 
            m.name, 
            m.company_name, 
            m.approved,
            m.created_at,
            COUNT(p.id) as product_count
        FROM merchants m
        LEFT JOIN products p ON m.wallet_address = p.wallet_address
        GROUP BY m.wallet_address, m.name, m.company_name, m.approved, m.created_at
        ORDER BY m.created_at DESC
    """)
    
    data = cur.fetchall()
    cur.close()
    conn.close()
    
    return [
        {
            "wallet_address": row[0],
            "name": row[1],
            "company_name": row[2],
            "approved": row[3],
            "created_at": row[4].isoformat() if row[4] else None,
            "product_count": row[5]
        }
        for row in data
    ]


@app.get("/admin/products")
def admin_products():
    conn = get_conn()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT 
            p.id,
            p.title,
            p.price,
            p.product_type,
            p.wallet_address as merchant_wallet,
            p.approved,
            p.created_at,
            u.username
        FROM products p
        LEFT JOIN users u ON p.wallet_address = u.wallet_address
        ORDER BY p.created_at DESC
    """)
    
    data = cur.fetchall()
    cur.close()
    conn.close()
    
    return [
        {
            "id": row[0],
            "title": row[1],
            "price": float(row[2]) if row[2] else 0,
            "product_type": row[3],
            "merchant_wallet": row[4],
            "approved": row[5],
            "created_at": row[6].isoformat() if row[6] else None,
            "merchant_name": row[7]
        }
        for row in data
    ]

@app.get("/admin/orders")
def admin_orders():
    conn = get_conn()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT 
            o.id,
            o.order_id_onchain,
            o.buyer_wallet,
            o.seller_wallet,
            o.status,
            o.amount,
            o.created_at,
            p.title as product_title
        FROM orders o
        LEFT JOIN products p ON o.product_id = p.id
        ORDER BY o.created_at DESC
    """)
    
    data = cur.fetchall()
    cur.close()
    conn.close()
    
    return [
        {
            "id": row[0],
            "order_id_onchain": row[1],
            "buyer_wallet": row[2],
            "seller_wallet": row[3],
            "status": row[4],
            "amount": float(row[5]) if row[5] else 0,
            "created_at": row[6].isoformat() if row[6] else None,
            "product_title": row[7]
        }
        for row in data
    ]

@app.get("/admin/total-sales")
def admin_total_sales():
    conn = get_conn()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT COALESCE(SUM(amount), 0)
        FROM orders
        WHERE status = 'COMPLETED'
    """)
    
    total = cur.fetchone()[0]
    cur.close()
    conn.close()
    
    return {"total": float(total) if total else 0}


@app.get("/admin/total-orders")
def admin_total_order_amount():
    conn = get_conn()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT COALESCE(SUM(amount), 0)
        FROM orders
    """)
    
    total = cur.fetchone()[0]
    cur.close()
    conn.close()
    
    return {"total": float(total) if total else 0}



@app.get("/admin/messages")
def admin_messages():

 conn=get_conn()
 cur=conn.cursor()

 cur.execute("SELECT sender_wallet,receiver_wallet FROM messages")

 data=cur.fetchall()

 cur.close()
 conn.close()

 return [{"sender_wallet":x[0],"receiver_wallet":x[1]} for x in data]


@app.get("/admin/support")
def admin_support():

 conn=get_conn()
 cur=conn.cursor()

 cur.execute("SELECT message FROM support_messages")

 data=cur.fetchall()

 cur.close()
 conn.close()

 return [{"message":x[0]} for x in data]


@app.get("/admin/wallet/{wallet}")
def admin_wallet(wallet:str):

    conn = get_conn()
    cur = conn.cursor()

    # total orders
    cur.execute("""
    SELECT COUNT(*)
    FROM orders
    WHERE buyer_wallet=%s
    """,(wallet,))
    total_orders = cur.fetchone()[0]

    # total sales
    cur.execute("""
    SELECT COALESCE(SUM(p.price),0)
    FROM orders o
    JOIN products p ON o.product_id=p.id
    WHERE o.seller_wallet=%s
    """,(wallet,))
    total_sales = cur.fetchone()[0]

    # linked wallets (buyers/sellers)
    cur.execute("""
    SELECT DISTINCT buyer_wallet
    FROM orders
    WHERE seller_wallet=%s
    """,(wallet,))
    buyers = [x[0] for x in cur.fetchall()]

    cur.execute("""
    SELECT DISTINCT seller_wallet
    FROM orders
    WHERE buyer_wallet=%s
    """,(wallet,))
    sellers = [x[0] for x in cur.fetchall()]

    linked_wallets = list(set(buyers + sellers))

    cur.close()
    conn.close()

    return {
        "total_orders": total_orders,
        "total_sales": float(total_sales),
        "linked_wallets": linked_wallets
    }


@app.get("/admin/messages")
def admin_messages():

    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
    SELECT sender_wallet,receiver_wallet,message,created_at
    FROM messages
    ORDER BY created_at DESC
    """)

    data = cur.fetchall()

    cur.close()
    conn.close()

    return [
        {
            "sender_wallet":x[0],
            "receiver_wallet":x[1],
            "message":x[2],
            "created_at":x[3]
        }
        for x in data
    ]



