# ClientAI Tool Catalog

## Tool Name  
`create_irrigation_recommendation`

## Purpose  
Generate an irrigation water recommendation for a specified block based on crop, ET, soil, and irrigation history. This is the crown jewel.

## Required Inputs  
- token (string)  
- block_id (integer)  
- recommendation_date (date)

## Output  
- status  
- block_id  
- recommended_inches  
- recommended_minutes  
- confidence  
- reasoning_summary  
- budget_status

## Key Rule  
ClientAI must never fabricate recommendation values and must read current data before calling.
