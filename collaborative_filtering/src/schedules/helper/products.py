import requests
from src.config import config

def get_products():
    rs = requests.get(f'{config.SERVER_URL}/api/product')
    rs = rs.json()

    products = rs.get('productData')
    return_products = []
    for product in products:
        for rating in product.get("ratings", []):
            train_item = {
                "user_id": rating.get("postedBy", "null"),
                "item_id": product.get("_id", "null"),
                "rating": float(rating.get("star"))
            }
            return_products.append(train_item)

    return return_products