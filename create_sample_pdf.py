import os

def create_simple_pdf(filename):
    pages_content = [
        "Page 1: KitabXumar - Uyghur PDF Oqughuch",
        "Page 2: 1-Bap: Elektron Kitab Oqush Medeniyiti",
        "Page 3: 2-Bap: Oqughan Yeridin Dawamlashturush",
        "Page 4: 3-Bap: Resimge Tartish We Xatire Qaldurush",
        "Page 5: 4-Bap: Xulase We Paydiliq Qollanma"
    ]

    objects = []
    
    # 1: Catalog
    # 2: Pages
    # For each page: Page object + Content stream object
    
    num_pages = len(pages_content)
    # obj 1: Catalog
    # obj 2: Outlines
    # obj 3: Pages tree
    # page objs: 4, 6, 8, 10, 12
    # stream objs: 5, 7, 9, 11, 13
    
    page_ids = [4 + i*2 for i in range(num_pages)]
    kids_str = " ".join([f"{pid} 0 R" for pid in page_ids])
    
    body = []
    
    body.append("1 0 obj\n<< /Type /Catalog /Pages 3 0 R >>\nendobj\n")
    body.append("2 0 obj\n<< /Type /Outlines /Count 0 >>\nendobj\n")
    body.append(f"3 0 obj\n<< /Type /Pages /Kids [{kids_str}] /Count {num_pages} >>\nendobj\n")
    
    for i, content in enumerate(pages_content):
        pid = 4 + i*2
        cid = pid + 1
        stream_text = f"BT /F1 22 Tf 80 720 Td ({content}) Tj ET\n"
        stream_text += f"BT /F1 14 Tf 80 670 Td (KitabXumar Test Kitabi - Bet {i+1} / {num_pages}) Tj ET\n"
        stream_text += f"BT /F1 12 Tf 80 620 Td (Desktop Application with RTL Uyghur Interface) Tj ET\n"
        stream_bytes = stream_text.encode('latin1')
        
        page_obj = (
            f"{pid} 0 obj\n"
            f"<< /Type /Page /Parent 3 0 R /MediaBox [0 0 595 842]\n"
            f"/Contents {cid} 0 R\n"
            f"/Resources << /ProcSet [/PDF /Text] /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>\n"
            f">> endobj\n"
        )
        stream_obj = (
            f"{cid} 0 obj\n"
            f"<< /Length {len(stream_bytes)} >>\n"
            f"stream\n"
            f"{stream_text}"
            f"endstream\n"
            f"endobj\n"
        )
        body.append(page_obj)
        body.append(stream_obj)

    # Build PDF with xref
    header = "%PDF-1.4\n"
    offsets = []
    current_offset = len(header.encode('latin1'))
    
    final_output = header
    for obj_str in body:
        offsets.append(current_offset)
        final_output += obj_str
        current_offset += len(obj_str.encode('latin1'))
        
    xref_offset = current_offset
    final_output += f"xref\n0 {len(offsets)+1}\n0000000000 65535 f \n"
    for off in offsets:
        final_output += f"{off:010d} 00000 n \n"
        
    final_output += (
        f"trailer\n"
        f"<< /Size {len(offsets)+1} /Root 1 0 R >>\n"
        f"startxref\n"
        f"{xref_offset}\n"
        f"%%EOF\n"
    )
    
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, "wb") as f:
        f.write(final_output.encode('latin1'))
    print("Created:", filename)

if __name__ == "__main__":
    create_simple_pdf("public/sample_kitap.pdf")
