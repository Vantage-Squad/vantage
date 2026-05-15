CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transaction_history (
    id UUID PRIMARY KEY,
    account_id VARCHAR(255) NOT NULL,
    amount DECIMAL(20, 2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    trust_score DOUBLE PRECISION NOT NULL,
    agent_summary TEXT,
    metadata JSONB,
    is_false_positive BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transaction_history_account_id ON transaction_history(account_id);

CREATE TABLE IF NOT EXISTS account_states (
    account_id VARCHAR(255) PRIMARY KEY,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_frozen BOOLEAN DEFAULT FALSE,
    frozen_by_id UUID REFERENCES users(id)
);
