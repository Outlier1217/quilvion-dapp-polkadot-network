--
-- PostgreSQL database dump
--

\restrict 23MJJXnOMzvXUu60XuQVwFdHsGzXGe6jAWpQdJxWoOlTLNq6eLbFqPsMohVaP0b

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2026-03-09 13:18:48

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 218 (class 1259 OID 17354)
-- Name: merchants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.merchants (
    wallet_address text NOT NULL,
    name text,
    company_name text,
    address text,
    email text,
    approved boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    product_type text
);


ALTER TABLE public.merchants OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 17521)
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    sender_wallet text NOT NULL,
    receiver_wallet text NOT NULL,
    message text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_read boolean DEFAULT false
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 17520)
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO postgres;

--
-- TOC entry 4968 (class 0 OID 0)
-- Dependencies: 225
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- TOC entry 222 (class 1259 OID 17385)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    order_id_onchain bigint,
    buyer_wallet text,
    seller_wallet text,
    product_id integer,
    status text,
    risk_score integer,
    tx_hash text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 17384)
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO postgres;

--
-- TOC entry 4969 (class 0 OID 0)
-- Dependencies: 221
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- TOC entry 224 (class 1259 OID 17484)
-- Name: platform_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.platform_settings (
    id integer NOT NULL,
    daily_limit numeric DEFAULT 1000,
    admin_threshold numeric DEFAULT 1000,
    platform_fee_bps integer DEFAULT 184,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.platform_settings OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 17483)
-- Name: platform_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.platform_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.platform_settings_id_seq OWNER TO postgres;

--
-- TOC entry 4970 (class 0 OID 0)
-- Dependencies: 223
-- Name: platform_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.platform_settings_id_seq OWNED BY public.platform_settings.id;


--
-- TOC entry 220 (class 1259 OID 17369)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    wallet_address text,
    title text,
    description text,
    image_url text,
    price numeric,
    product_type text,
    approved boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    download_link text
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 17368)
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- TOC entry 4971 (class 0 OID 0)
-- Dependencies: 219
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- TOC entry 228 (class 1259 OID 17533)
-- Name: support_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.support_messages (
    id integer NOT NULL,
    sender_wallet text,
    sender_name text,
    seller_wallet text,
    message text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.support_messages OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 17532)
-- Name: support_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.support_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.support_messages_id_seq OWNER TO postgres;

--
-- TOC entry 4972 (class 0 OID 0)
-- Dependencies: 227
-- Name: support_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.support_messages_id_seq OWNED BY public.support_messages.id;


--
-- TOC entry 217 (class 1259 OID 17344)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    wallet_address text NOT NULL,
    username text NOT NULL,
    profile_image text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 4783 (class 2604 OID 17524)
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- TOC entry 4776 (class 2604 OID 17388)
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- TOC entry 4778 (class 2604 OID 17487)
-- Name: platform_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_settings ALTER COLUMN id SET DEFAULT nextval('public.platform_settings_id_seq'::regclass);


--
-- TOC entry 4773 (class 2604 OID 17372)
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- TOC entry 4786 (class 2604 OID 17536)
-- Name: support_messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_messages ALTER COLUMN id SET DEFAULT nextval('public.support_messages_id_seq'::regclass);


--
-- TOC entry 4952 (class 0 OID 17354)
-- Dependencies: 218
-- Data for Name: merchants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.merchants (wallet_address, name, company_name, address, email, approved, created_at, product_type) FROM stdin;
0xbB7266164241E249DD7EcaD53ED59474015685eA	Mustak Aalam	B M info tech	New Delhi	alam@gmail.com	t	2026-03-08 23:18:39.570931	BOTH
\.


--
-- TOC entry 4960 (class 0 OID 17521)
-- Dependencies: 226
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, sender_wallet, receiver_wallet, message, created_at, is_read) FROM stdin;
1	0x2546BcD3c84621e976D8185a91A922aE77ECEc30	0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199	hl	2026-03-07 15:06:35.493665	t
3	0x2546BcD3c84621e976D8185a91A922aE77ECEc30	0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199	how are you	2026-03-07 15:29:28.041063	t
4	0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266	0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199	hlo	2026-03-07 15:35:16.020804	t
6	0xBcd4042DE499D14e55001CcbB24a551F3b954096	0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199	hhh	2026-03-07 16:01:48.851857	t
7	0xBcd4042DE499D14e55001CcbB24a551F3b954096	0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199	hello	2026-03-07 20:04:16.012096	t
8	0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266	0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199	ho	2026-03-08 09:35:07.257077	t
13	0x2546BcD3c84621e976D8185a91A922aE77ECEc30	0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199	hlo	2026-03-08 13:05:29.055793	t
14	0x2546BcD3c84621e976D8185a91A922aE77ECEc30	0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199	heelp	2026-03-08 13:09:48.74241	t
15	0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266	0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199	jj	2026-03-08 18:55:23.727348	t
16	0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199	0xBcd4042DE499D14e55001CcbB24a551F3b954096	jj	2026-03-08 19:14:21.817156	t
17	0xAb06a17af1425F499E302B639c69f8ce29a967E0	0xbB7266164241E249DD7EcaD53ED59474015685eA	hellp	2026-03-09 00:24:47.464276	t
18	0xAb06a17af1425F499E302B639c69f8ce29a967E0	0xbB7266164241E249DD7EcaD53ED59474015685eA	hlo	2026-03-09 00:24:57.756642	t
19	0xbB7266164241E249DD7EcaD53ED59474015685eA	0xAb06a17af1425F499E302B639c69f8ce29a967E0	hii	2026-03-09 00:26:04.417005	t
2	0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199	0x2546BcD3c84621e976D8185a91A922aE77ECEc30	hlo	2026-03-07 15:28:36.072677	t
9	0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199	0x2546BcD3c84621e976D8185a91A922aE77ECEc30	hlo	2026-03-08 12:11:14.300761	t
10	0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199	0x2546BcD3c84621e976D8185a91A922aE77ECEc30	hlo	2026-03-08 12:15:08.387401	t
11	0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199	0x2546BcD3c84621e976D8185a91A922aE77ECEc30	hlo	2026-03-08 12:20:06.663176	t
12	0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199	0x2546BcD3c84621e976D8185a91A922aE77ECEc30	how are you	2026-03-08 12:20:17.911049	t
5	0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199	0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266	hlollll	2026-03-07 15:35:51.666643	t
\.


--
-- TOC entry 4956 (class 0 OID 17385)
-- Dependencies: 222
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, order_id_onchain, buyer_wallet, seller_wallet, product_id, status, risk_score, tx_hash, created_at) FROM stdin;
1	3	0xAb06a17af1425F499E302B639c69f8ce29a967E0	0xbB7266164241E249DD7EcaD53ED59474015685eA	1	COMPLETED	0	0x57c823566173afc39b3aa4f007153d5bd5d71463680eecc931254326c85dd510	2026-03-08 23:49:10.174109
3	5	0xAb06a17af1425F499E302B639c69f8ce29a967E0	0xbB7266164241E249DD7EcaD53ED59474015685eA	2	COMPLETED	0	0xab36c8fc6f91003a34c85ab42cb46cd9d85fb4ca9189ad4dea653473c525d200	2026-03-09 00:02:29.688594
2	4	0xAb06a17af1425F499E302B639c69f8ce29a967E0	0xbB7266164241E249DD7EcaD53ED59474015685eA	2	COMPLETED	0	0xef7c4acb26f495d4f9ac5ab8c8bc961487dbd50c9576468dfc4dc8b72d36c6b6	2026-03-08 23:49:32.948343
4	6	0x528C4B8aCf320F312c298CBdA60Acb15D198Ba52	0xbB7266164241E249DD7EcaD53ED59474015685eA	1	COMPLETED	0	0x7b8bab58fb371fb9223b4df7e1387f62fac6d60d5a539e43834cabc0c44789c5	2026-03-09 10:41:00.574257
5	7	0x528C4B8aCf320F312c298CBdA60Acb15D198Ba52	0xbB7266164241E249DD7EcaD53ED59474015685eA	2	COMPLETED	0	0xb82515478cdc2be272e56f6be31b6f9e49fbd316edb9615d9ab58b68afe5b40e	2026-03-09 10:41:31.63772
6	8	0xAb06a17af1425F499E302B639c69f8ce29a967E0	0xbB7266164241E249DD7EcaD53ED59474015685eA	1	COMPLETED	0	0x15cffa22dfb5cf8cc34df9a61d561bcd4f7b60283b64e6dbc20623cb9236c780	2026-03-09 12:53:42.000125
7	9	0xAb06a17af1425F499E302B639c69f8ce29a967E0	0xbB7266164241E249DD7EcaD53ED59474015685eA	2	COMPLETED	0	0x352fea415c25b1025de93e6be61be4f9cca1142ec67785d2eb36fac67f061b67	2026-03-09 12:54:06.190691
\.


--
-- TOC entry 4958 (class 0 OID 17484)
-- Dependencies: 224
-- Data for Name: platform_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.platform_settings (id, daily_limit, admin_threshold, platform_fee_bps, updated_at) FROM stdin;
1	1000.0	1000.0	184	2026-03-08 23:56:33.439731
\.


--
-- TOC entry 4954 (class 0 OID 17369)
-- Dependencies: 220
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, wallet_address, title, description, image_url, price, product_type, approved, created_at, download_link) FROM stdin;
1	0xbB7266164241E249DD7EcaD53ED59474015685eA	My Note	An AI-powered decentralized escrow commerce platform that enables secure peer-to-peer buying and selling using smart contracts. Payments are held in escrow, analyzed by an AI risk engine, and automatically released or flagged to prevent fraud and ensure trustless transactions.	http://localhost:8000/uploads/7fba4f10-78ed-40df-9e6d-2ce4fed5f532_ChatGPT Image Feb 14, 2026, 08_04_50 PM.png	12.0	DIGITAL	t	2026-03-08 23:18:39.741837	https://www.youtube.com/@Outlier1217
2	0xbB7266164241E249DD7EcaD53ED59474015685eA	dAPP Code 	An AI-powered decentralized escrow commerce platform that enables secure peer-to-peer buying and selling using smart contracts. Payments are held in escrow, analyzed by an AI risk engine, and automatically released or flagged to prevent fraud and ensure trustless transactions.	http://localhost:8000/uploads/d6f66e06-a61d-43ed-902e-43b20fb7c67f_ChatGPT Image Feb 14, 2026, 08_02_14 PM.png	25.02	PHYSICAL	t	2026-03-08 23:47:28.945897	\N
3	0xbB7266164241E249DD7EcaD53ED59474015685eA	Quantum	An AI-powered decentralized escrow commerce platform that enables secure peer-to-peer buying and selling using smart contracts. Payments are held in escrow, analyzed by an AI risk engine, and automatically released or flagged to prevent fraud and ensure trustless transactions.	http://localhost:8000/uploads/f062add9-49e1-4d0b-9623-ccca8d0921fe_ChatGPT Image Feb 12, 2026, 09_07_08 PM.png	1004.98	DIGITAL	t	2026-03-08 23:48:07.674678	https://www.youtube.com/@Outlier1217
\.


--
-- TOC entry 4962 (class 0 OID 17533)
-- Dependencies: 228
-- Data for Name: support_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.support_messages (id, sender_wallet, sender_name, seller_wallet, message, created_at) FROM stdin;
1	0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266	\N	0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266	hello	2026-03-07 21:10:01.202721
2	\N	Mustak Aalam	\N	hghg	2026-03-07 21:10:57.039296
3	0x2546BcD3c84621e976D8185a91A922aE77ECEc30	\N	\N	hlo	2026-03-08 13:06:54.132689
4	0x528C4B8aCf320F312c298CBdA60Acb15D198Ba52	\N	\N	hllo	2026-03-09 00:34:05.475122
\.


--
-- TOC entry 4951 (class 0 OID 17344)
-- Dependencies: 217
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (wallet_address, username, profile_image, created_at) FROM stdin;
0xAb06a17af1425F499E302B639c69f8ce29a967E0	user_skp6vw	\N	2026-03-08 23:14:38.501216
0xbB7266164241E249DD7EcaD53ED59474015685eA	mustak1217	\N	2026-03-08 23:14:57.106802
0x528C4B8aCf320F312c298CBdA60Acb15D198Ba52	user_pfs7wd	\N	2026-03-09 00:33:52.986564
\.


--
-- TOC entry 4973 (class 0 OID 0)
-- Dependencies: 225
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 19, true);


--
-- TOC entry 4974 (class 0 OID 0)
-- Dependencies: 221
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 7, true);


--
-- TOC entry 4975 (class 0 OID 0)
-- Dependencies: 223
-- Name: platform_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.platform_settings_id_seq', 1, true);


--
-- TOC entry 4976 (class 0 OID 0)
-- Dependencies: 219
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 3, true);


--
-- TOC entry 4977 (class 0 OID 0)
-- Dependencies: 227
-- Name: support_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.support_messages_id_seq', 4, true);


--
-- TOC entry 4793 (class 2606 OID 17362)
-- Name: merchants merchants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.merchants
    ADD CONSTRAINT merchants_pkey PRIMARY KEY (wallet_address);


--
-- TOC entry 4801 (class 2606 OID 17530)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- TOC entry 4797 (class 2606 OID 17393)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 4799 (class 2606 OID 17495)
-- Name: platform_settings platform_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_settings
    ADD CONSTRAINT platform_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 4795 (class 2606 OID 17378)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 4803 (class 2606 OID 17541)
-- Name: support_messages support_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.support_messages
    ADD CONSTRAINT support_messages_pkey PRIMARY KEY (id);


--
-- TOC entry 4789 (class 2606 OID 17351)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (wallet_address);


--
-- TOC entry 4791 (class 2606 OID 17353)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4804 (class 2606 OID 17363)
-- Name: merchants merchants_wallet_address_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.merchants
    ADD CONSTRAINT merchants_wallet_address_fkey FOREIGN KEY (wallet_address) REFERENCES public.users(wallet_address);


--
-- TOC entry 4805 (class 2606 OID 17379)
-- Name: products products_wallet_address_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_wallet_address_fkey FOREIGN KEY (wallet_address) REFERENCES public.users(wallet_address);


-- Completed on 2026-03-09 13:18:48

--
-- PostgreSQL database dump complete
--

\unrestrict 23MJJXnOMzvXUu60XuQVwFdHsGzXGe6jAWpQdJxWoOlTLNq6eLbFqPsMohVaP0b

