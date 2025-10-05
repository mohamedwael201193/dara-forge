@echo off
setlocal

REM Set environment variables
set RPC_ENDPOINT=https://evmrpc-testnet.0g.ai
set ZG_PRIVATE_KEY=0xe7db771abed2bdb3cbfd995708087890006046098688409238d180d7e897ca8e

REM Run the 0G CLI with node explicitly
node "%~dp0node_modules\@0glabs\0g-serving-broker\cli.commonjs\cli\index.js" %*