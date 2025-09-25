#!/usr/bin/env python3
"""
Simple script to run database population
"""

import os
import sys
import asyncio

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def main():
    print("Afropedia Database Population")
    print("=" * 40)
    print("Choose population method:")
    print("1. Supabase (Recommended for current setup)")
    print("2. SQLModel (If using local database)")
    print()
    
    choice = input("Enter your choice (1 or 2): ").strip()
    
    if choice == "1":
        print("\nRunning Supabase population...")
        from populate_supabase import main as supabase_main
        supabase_main()
    elif choice == "2":
        print("\nRunning SQLModel population...")
        from populate_db import main as sqlmodel_main
        asyncio.run(sqlmodel_main())
    else:
        print("Invalid choice. Please run the script again and choose 1 or 2.")
        return
    
    print("\nPopulation completed!")

if __name__ == "__main__":
    main()
