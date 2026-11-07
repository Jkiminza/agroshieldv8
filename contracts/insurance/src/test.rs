#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_initialize_and_buy_policy() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(AgroShield, ());
    let client = AgroShieldClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let oracle = Address::generate(&env);
    let farmer = Address::generate(&env);

    // 1. Initialize
    client.initialize(&admin, &oracle);

    // 2. Buy a policy
    let policy_id = client.buy_policy(
        &farmer,
        &100_0000000,  // premium (10 XLM in stroops)
        &1000_0000000, // coverage amount (1000 XLM)
        &17280,        // duration in ledgers (~1 day)
        &25,           // rainfall threshold (25mm)
        &30,           // period days
    );

    assert_eq!(policy_id, 1);

    // 3. Check the policy
    let policy = client.get_policy(&policy_id);
    assert_eq!(policy.farmer, farmer);
    assert_eq!(policy.premium, 100_0000000);
    assert_eq!(policy.coverage_amount, 1000_0000000);
    assert_eq!(policy.rainfall_threshold, 25);
    assert_eq!(policy.is_active, true);
    assert_eq!(policy.paid_out, false);

    // 4. Check total premiums
    let total = client.get_total_premiums();
    assert_eq!(total, 100_0000000);
}

#[test]
fn test_report_rainfall_trigger() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(AgroShield, ());
    let client = AgroShieldClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let oracle = Address::generate(&env);
    let farmer = Address::generate(&env);

    client.initialize(&admin, &oracle);

    let policy_id = client.buy_policy(
        &farmer,
        &100,
        &1000,
        &100,
        &25,
        &30,
    );

    client.report_rainfall(&policy_id, &20); // 20 < 25, should trigger payout

    let policy = client.get_policy(&policy_id);
    assert_eq!(policy.paid_out, true);
    assert_eq!(policy.is_active, false);
}

#[test]
fn test_report_rainfall_no_trigger() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(AgroShield, ());
    let client = AgroShieldClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let oracle = Address::generate(&env);
    let farmer = Address::generate(&env);

    client.initialize(&admin, &oracle);

    let policy_id = client.buy_policy(
        &farmer,
        &100,
        &1000,
        &100,
        &25,
        &30,
    );

    client.report_rainfall(&policy_id, &30); // 30 > 25, no payout

    let policy = client.get_policy(&policy_id);
    assert_eq!(policy.paid_out, false);
    assert_eq!(policy.is_active, true);
}
