#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, Symbol, Vec, String, Map
};

#[contracttype]
#[derive(Clone)]
pub struct Policy {
    pub farmer: Address,
    pub premium: i128,
    pub coverage_amount: i128,
    pub start_ledger: u32,
    pub end_ledger: u32,
    pub rainfall_threshold: u32,      // e.g. 25 (mm)
    pub period_days: u32,             // e.g. 30 days
    pub is_active: bool,
    pub paid_out: bool,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Oracle,
    PolicyCounter,
    Policy(u32),
    TotalPremiums,
}

#[contract]
pub struct AgroShield;

#[contractimpl]
impl AgroShield {
    // Initialize the contract (call this only once after deploy)
    pub fn initialize(env: Env, admin: Address, oracle: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Oracle, &oracle);
        env.storage().instance().set(&DataKey::PolicyCounter, &0u32);
        env.storage().instance().set(&DataKey::TotalPremiums, &0i128);
    }

    // Farmer buys coverage
    pub fn buy_policy(
        env: Env,
        farmer: Address,
        premium: i128,
        coverage_amount: i128,
        duration_ledgers: u32,       // approximate coverage period
        rainfall_threshold: u32,    // e.g. 25
        period_days: u32,           // e.g. 30
    ) -> u32 {
        farmer.require_auth();

        let counter: u32 = env.storage().instance().get(&DataKey::PolicyCounter).unwrap_or(0);
        let policy_id = counter + 1;

        let policy = Policy {
            farmer: farmer.clone(),
            premium,
            coverage_amount,
            start_ledger: env.ledger().sequence(),
            end_ledger: env.ledger().sequence() + duration_ledgers,
            rainfall_threshold,
            period_days,
            is_active: true,
            paid_out: false,
        };

        env.storage().persistent().set(&DataKey::Policy(policy_id), &policy);
        env.storage().instance().set(&DataKey::PolicyCounter, &policy_id);

        // Track total premiums (simplified)
        let mut total: i128 = env.storage().instance().get(&DataKey::TotalPremiums).unwrap_or(0);
        total += premium;
        env.storage().instance().set(&DataKey::TotalPremiums, &total);

        policy_id
    }

    // Oracle reports rainfall for a region (simplified version)
    // In real version we will make this more advanced
    pub fn report_rainfall(env: Env, policy_id: u32, rainfall_mm: u32) {
        let oracle: Address = env.storage().instance().get(&DataKey::Oracle).unwrap();
        oracle.require_auth();

        let mut policy: Policy = env.storage().persistent().get(&DataKey::Policy(policy_id)).unwrap();

        if !policy.is_active || policy.paid_out {
            panic!("Policy not active");
        }

        // Simple parametric trigger
        if rainfall_mm < policy.rainfall_threshold {
            // Trigger payout
            policy.paid_out = true;
            policy.is_active = false;
            env.storage().persistent().set(&DataKey::Policy(policy_id), &policy);

            // In real version we transfer tokens here
            // For now we just mark it as paid
        }
    }

    // View a policy
    pub fn get_policy(env: Env, policy_id: u32) -> Policy {
        env.storage().persistent().get(&DataKey::Policy(policy_id)).unwrap()
    }

    // Get total premiums collected
    pub fn get_total_premiums(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::TotalPremiums).unwrap_or(0)
    }
}

mod test;
