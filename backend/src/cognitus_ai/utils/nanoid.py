from nanoid import generate

def generate_id(alphabet="abcdefghijklmnopqrstuvwxyz0123456789", size=16):
    return generate(alphabet, size)