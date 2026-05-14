import os
import glob

replacements = {
    "'#0d1117'": "'#ffffff'",
    "'#30363d'": "'var(--border-color)'",
    "'#00ff41'": "'var(--cyber-blue)'",
    "'#8b949e'": "'var(--text-muted)'",
    "'#010409'": "'#f8fafc'",
    "'#1e293b'": "'var(--border-color)'",
    "'#e6edf3'": "'var(--text-main)'",
    "'#00ff88'": "'var(--cyber-blue)'",
    "'#00d4ff'": "'var(--cyber-purple)'",
    "'#1f2937'": "'var(--border-color)'",
    "'rgba(0,255,136,0.1)'": "'rgba(14,165,233,0.1)'",
    "'rgba(0, 255, 136, 0.1)'": "'rgba(14, 165, 233, 0.1)'",
    "'rgba(0,255,136,0.15)'": "'rgba(14,165,233,0.15)'",
    "'rgba(0, 255, 136, 0.15)'": "'rgba(14, 165, 233, 0.15)'",
    "'rgba(0,255,136,0.2)'": "'rgba(14,165,233,0.2)'",
    "'rgba(0, 255, 136, 0.2)'": "'rgba(14, 165, 233, 0.2)'",
    "'rgba(0,255,136,0.3)'": "'rgba(14,165,233,0.3)'",
    "'rgba(0, 255, 136, 0.3)'": "'rgba(14, 165, 233, 0.3)'",
    "'#0ea5e9'": "'var(--cyber-blue)'",
    "'#cbd5e1'": "'var(--text-muted)'",
    "'#0f172a'": "'var(--text-main)'",
}

files = glob.glob('src/pages/**/*.tsx', recursive=True)

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(file, 'w') as f:
            f.write(new_content)
        print(f"Updated {file}")

