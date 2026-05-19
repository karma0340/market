"""
Script to convert Project_Report.html to a Word document (DOCX).

Prerequisites:
You need to install the 'pypandoc' library.
Run the following command in your terminal:
    pip install pypandoc

Note: If you don't have pandoc installed on your system, the script will automatically
attempt to download and install it for you.
"""

import os
import sys

try:
    import pypandoc
except ImportError:
    print("The 'pypandoc' module is not installed.")
    print("Please install it by running: pip install pypandoc")
    sys.exit(1)

def convert_html_to_docx(html_path, docx_path):
    if not os.path.exists(html_path):
        print(f"Error: Could not find '{html_path}'. Please ensure the file exists.")
        return

    print(f"Starting conversion of {html_path} to {docx_path}...")
    
    try:
        # pypandoc.convert_file will try to convert the file using pandoc
        pypandoc.convert_file(html_path, 'docx', outputfile=docx_path)
        print(f"Success! Successfully created '{docx_path}'.")
    except OSError:
        # OSError usually means pandoc is not installed on the system
        print("Pandoc is not installed on your system. Downloading pandoc now...")
        try:
            pypandoc.download_pandoc()
            print("Download complete. Retrying conversion...")
            pypandoc.convert_file(html_path, 'docx', outputfile=docx_path)
            print(f"Success! Successfully created '{docx_path}'.")
        except Exception as e:
            print(f"An error occurred while downloading pandoc or converting: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during conversion: {e}")

if __name__ == "__main__":
    html_file = "Project_Report.html"
    docx_file = "Project_Report.docx"
    convert_html_to_docx(html_file, docx_file)
