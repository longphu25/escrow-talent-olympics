# Combine set_local and run into a single make command
all: set_local run

# Placeholder for a run command, replace with actual command
run:
	echo "Running your Solana application..."

# Set Solana config to localhost
url-local:
	solana config set --url localhost

# Set Solana config to localhost
url-dev:
	solana config set --url devnet

run-node:
	solana-test-validator -r

# ~/.config/solana/devnet.json
# https://blog.nashtechglobal.com/solana-wallet-creation-and-sending-tokens/
create-wallet:
	solana-keygen new --outfile ~/.config/solana/wallet1.json

airdrop:
  solana airdrop 1 6hPGsPpMdZdEQg9nwKYfHLE9eKAAVQycCoW2e4rTvEHY --url https://api.devnet.solana.com

