import asyncio
from services.number_validator_api import number_validator_client

async def main():
    print("Testing NumberValidatorAPI...")
    res = await number_validator_client.lookup_operator_circle("9876543210")
    print(f"Result: {res}")
    await number_validator_client.close()

if __name__ == "__main__":
    asyncio.run(main())
