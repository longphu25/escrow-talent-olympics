use anchor_lang::prelude::*;

declare_id!("km84oRDGqSzKViz8T2XgzXKootCgWBswpRupsDkKvTQ");

#[program]
pub mod basic {
    use super::*;

    pub fn greet(_ctx: Context<Initialize>) -> Result<()> {
        msg!("GM!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
