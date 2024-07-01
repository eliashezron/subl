mod balances{
    use std::collections::BTreeMap;

/// This is the Balances Module.
/// It is a simple module which keeps track of how much balance each account has in this state
/// machine.
/* TODO: Add the derive macro to implement the `Debug` trait for `Pallet`. */
pub struct Pallet {
    // A simple storage mapping from accounts (`String`) to their balances (`u128`).
    balances: BTreeMap<String, u128>,
}

impl Pallet {
    /// Create a new instance of the balances module.
    pub fn new() -> Self {
        Self { balances: BTreeMap::new() }
    }

    /// Set the balance of an account `who` to some `amount`.
    pub fn set_balance(&mut self, who: &String, amount: u128) {
        self.balances.insert(who.clone(), amount);
    }

    /// Get the balance of an account `who`.
    /// If the account has no stored balance, we return zero.
    pub fn balance(&self, who: &String) -> u128 {
        *self.balances.get(who).unwrap_or(&0)
    }

    /// Transfer `amount` from one account to another.
    /// This function verifies that `from` has at least `amount` balance to transfer,
    /// and that no mathematical overflows occur.
    pub fn transfer(
        &mut self,
        caller: String,
        to: String,
        amount: u128,
    ) -> Result<(), &'static str> {
        let caller_balance = self.balance(&caller);
        let to_balance = self.balance(&to);

        let new_caller_balance = caller_balance.checked_sub(amount).ok_or("Not enough funds.")?;
        let new_to_balance = to_balance.checked_add(amount).ok_or("Overflow")?;

        self.balances.insert(caller, new_caller_balance);
        self.balances.insert(to, new_to_balance);

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn init_balances() {
        let mut balances = super::Pallet::new();

        assert_eq!(balances.balance(&"alice".to_string()), 0);
        balances.set_balance(&"alice".to_string(), 100);
        assert_eq!(balances.balance(&"alice".to_string()), 100);
        assert_eq!(balances.balance(&"bob".to_string()), 0);
    }

    #[test]
    fn transfer_balance() {
        let mut balances = super::Pallet::new();

        assert_eq!(
            balances.transfer("alice".to_string(), "bob".to_string(), 51),
            Err("Not enough funds.")
        );

        balances.set_balance(&"alice".to_string(), 100);
        assert_eq!(balances.transfer("alice".to_string(), "bob".to_string(), 51), Ok(()));
        assert_eq!(balances.balance(&"alice".to_string()), 49);
        assert_eq!(balances.balance(&"bob".to_string()), 51);

        assert_eq!(
            balances.transfer("alice".to_string(), "bob".to_string(), 51),
            Err("Not enough funds.")
        );
    }
}

}

mod system{
    use std::collections::BTreeMap;

/// This is the System Pallet.
/// It handles low level state needed for your blockchain.
/* TODO: Add the derive macro to implement the `Debug` trait for `Pallet`. */
pub struct Pallet {
    /// The current block number.
    block_number: u32,
    /// A map from an account to their nonce.
    nonce: BTreeMap<String, u32>,
}

impl Pallet {
    /// Create a new instance of the System Pallet.
    pub fn new() -> Self {
        Self { block_number: 0, nonce: BTreeMap::new() }
    }

    /// Get the current block number.
    pub fn block_number(&self) -> u32 {
        self.block_number
    }

    // This function can be used to increment the block number.
    // Increases the block number by one.
    pub fn inc_block_number(&mut self) {
        self.block_number += 1;
    }

    // Increment the nonce of an account. This helps us keep track of how many transactions each
    // account has made.
    pub fn inc_nonce(&mut self, who: &String) {
        let nonce: u32 = *self.nonce.get(who).unwrap_or(&0);
        let new_nonce = nonce + 1;
        self.nonce.insert(who.clone(), new_nonce);
    }
}

#[cfg(test)]
mod test {
    #[test]
    fn init_system() {
        let mut system = super::Pallet::new();
        system.inc_block_number();
        system.inc_nonce(&"alice".to_string());

        assert_eq!(system.block_number(), 1);
        assert_eq!(system.nonce.get("alice"), Some(&1));
        assert_eq!(system.nonce.get("bob"), None);
    }
}

}
use super::{balances, system};

// This is our main Runtime.
// It accumulates all of the different pallets we want to use.
/* TODO: Add the derive macro to implement the `Debug` trait for `Runtime`. */
pub struct Runtime {
    system: system::Pallet,
    balances: balances::Pallet,
}

impl Runtime {
    // Create a new instance of the main Runtime, by creating a new instance of each pallet.
    fn new() -> Self {
        Self { system: system::Pallet::new(), balances: balances::Pallet::new() }
    }
}

fn main() {
    let mut runtime = Runtime::new();
    let alice = "alice".to_string();
    let bob = "bob".to_string();
    let charlie = "charlie".to_string();

    runtime.balances.set_balance(&alice, 100);

    // start emulating a block
    runtime.system.inc_block_number();
    assert_eq!(runtime.system.block_number(), 1);

    // first transaction
    runtime.system.inc_nonce(&alice);
    let _res = runtime
        .balances
        .transfer(alice.clone(), bob, 30)
        .map_err(|e| eprintln!("{}", e));

    // second transaction
    runtime.system.inc_nonce(&alice);
    let _res = runtime.balances.transfer(alice, charlie, 20).map_err(|e| eprintln!("{}", e));

    /* TODO: Print the final runtime state after all transactions. */
}