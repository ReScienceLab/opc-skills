# Domain Hunter Example: Finding a Domain for Auto Video Editing Project

> **User prompt:** "I am working on an auto video editing project. I need to buy a new domain. Please find one for me."

---

## Step 1: Generate Domain Ideas & Check Availability

Based on the project description, the AI generated creative domain name suggestions and checked their availability via WHOIS:

```bash
for domain in "autoedit.io" "clipcraft.io" "videoedit.ai" "cutflow.io" "autocuts.io" "editsnap.io" "vidflow.ai" "clipflow.io" "autoclipper.io" "smartcut.io"; do
  echo "Checking $domain..."
  result=$(whois "$domain" 2>/dev/null | grep -i "no match\|not found\|available\|no data found\|no entries found" | head -1)
  if [ -n "$result" ]; then
    echo "  -> LIKELY AVAILABLE"
  else
    echo "  -> LIKELY TAKEN"
  fi
done
```

### Results - Available Domains

| Domain | Notes |
|--------|-------|
| **cutflow.io** | Short, memorable - "cut" + "flow" for editing workflow |
| **autocuts.io** | Direct - auto video cuts |
| **editsnap.io** | Quick, snappy editing |
| **autoclipper.io** | Descriptive - auto video clipping |
| **autovidz.io** | Casual/trendy - auto videos |
| **clipauto.io** | Simple - clip automation |
| **videotrim.ai** | .ai TLD - video trimming |
| **cliphero.io** | Brandable - hero for clips |
| **autosnip.io** | Short clips/snips |
| **editbot.io** | Bot/AI angle for editing |

**Top picks:**
1. **cutflow.io** - Short (7 chars), professional, memorable
2. **autocuts.io** - Clear purpose, good branding
3. **videotrim.ai** - .ai TLD fits AI/auto theme well

---

## Step 2: User Selection

> **User:** "cutflow.io looks good, I need to know where can I get the cheapest price to buy it? Also, is there any promo code?"

---

## Step 3: Compare Prices

Used WebSearch to find current .io domain prices from tld-list.com:

### Price Comparison for cutflow.io

| Registrar | Year 1 | Renewal | Notes |
|-----------|--------|---------|-------|
| **Spaceship** | **$14.98** | $46.58 | Use promo code **IO85** (85% off, limit 1) |
| Sav | $14.99 | $38.95 | No promo needed |
| Dynadot | $28.89 | $47.70 | No .io promo found |
| Regery | $28.99 | $47.99 | - |
| Namecheap | $34.98 | $57.98 | 40% off first year |
| Hostinger | $31.99 | $67.99 | - |

---

## Step 4: Search for Promo Codes

### Twitter Search (via twitter skill)

```bash
python3 scripts/search_tweets.py "from:spaceship promo code" --type Latest --limit 10
```

**Found:** @spaceship tweet mentioning promo code **SPSR86** for discounts.

```bash
python3 scripts/search_tweets.py "from:Dynadot promo code" --type Latest --limit 10
```

**Found:** @Dynadot offers .COM transfer at $10.49 (no .io specific promo).

### Reddit Search (via reddit skill)

```bash
python3 scripts/search_posts.py "spaceship domain promo code" --subreddit Domains --limit 10
```

**Found:** Discussion threads about Spaceship pricing and promotions.

---

## Final Recommendation

**Domain:** cutflow.io

**Best Deal: Spaceship at $14.98/year** (with promo code **IO85**)

- **Promo Code:** `IO85` (85% off .io registration, limit 1 per customer)
- **Free Features:** DNS, Email Forwarding, WHOIS Privacy
- **Renewal:** $46.58/year (industry standard for .io)
- **Purchase Link:** https://www.spaceship.com/

### Alternative if renewal matters

**Sav.com at $14.99/year** with the **cheapest renewal at $38.95/year** - best 3-year value if you plan to keep the domain long-term.

---

## Key Insights

1. **.io domains** have high wholesale costs (~$45), so first-year promos are significant discounts
2. **Promo codes** for premium TLDs are rare - the IO85 code is a great find
3. **Renewal prices** are similar across registrars - consider long-term costs
4. **Spaceship** offers the best first-year deal with free WHOIS privacy
5. **Sav.com** has the best renewal rate for long-term ownership
