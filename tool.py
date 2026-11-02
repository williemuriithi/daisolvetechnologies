import os

# Define the exact strings to find and replace
OLD_LINE = '<a class="nav-item flex flex-col items-center justify-center transition-transform active:scale-95 text-secondary hover:text-primary" data-tab="brands" href="brands.html"><span class="material-symbols-outlined text-2xl">devices</span><span class="text-label-sm font-label-sm">Brands</span></a>'
NEW_LINE = '<a class="nav-item flex flex-col items-center justify-center transition-transform active:scale-95 text-secondary hover:text-primary" data-tab="brands" href="blog.html"> <span class="material-symbols-outlined text-2xl">article</span> <span class="text-label-sm font-label-sm">Blogs</span>'

def update_html_files(directory="."):
    """
    Scans the directory for HTML files and replaces OLD_LINE with NEW_LINE.
    """
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(".html"):
                file_path = os.path.join(root, file)
                
                # Read the content of the file
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # Check if the target line exists in the file
                if OLD_LINE in content:
                    updated_content = content.replace(OLD_LINE, NEW_LINE)
                    
                    # Write the updated content back to the file
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(updated_content)
                    print(f"Updated: {file_path}")

if __name__ == "__main__":
    # Run the script in the current directory
    # Change "." to a specific folder path if your files are stored elsewhere
    update_html_files(".")
