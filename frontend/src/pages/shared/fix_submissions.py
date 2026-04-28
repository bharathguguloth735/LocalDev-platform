import os

file_path = r'c:\Users\GUGULOTH BHARATH\localbuisness\frontend\src\pages\shared\Submissions.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_content = content.replace('}`}`', '}`')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Done")
