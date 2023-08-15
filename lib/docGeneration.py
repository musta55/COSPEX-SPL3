
import torch
from transformers import GPT2LMHeadModel, GPT2Tokenizer

# Load GPT-2 model and tokenizer
model_name = "gpt2-medium"
model = GPT2LMHeadModel.from_pretrained(model_name)
tokenizer = GPT2Tokenizer.from_pretrained(model_name)

# Provide the code snippet you want to convert to an explanation
code_snippet = """
import inspect
def quick_sort(collection: list) -> list:
    if len(collection) < 2:
        return collection
    pivot = collection.pop()  # Use the last element as the first pivot
    greater = []  # All elements greater than pivot
    lesser = []  # All elements less than or equal to pivot
    for element in collection:
        (greater if element > pivot else lesser).append(element)
    return quick_sort(lesser) + [pivot] + quick_sort(greater)

user_input = "32,13,56,24,87,5,12,5".strip()
unsorted = [int(item) for item in user_input.split(",")]
print(quick_sort(unsorted))
"""

# Generate explanation using the GPT-2 model
prompt = f"Convert the following Python code into an explanation:\n\n{code_snippet}\n\nExplanation:"
input_ids = tokenizer.encode(prompt, return_tensors="pt")

# Generate explanation
with torch.no_grad():
    output = model.generate(input_ids, max_length=300, num_return_sequences=1, no_repeat_ngram_size=2)

# Decode and display the explanation
explanation = tokenizer.decode(output[0], skip_special_tokens=True)
print(explanation)
