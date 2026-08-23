#!/usr/bin/env bash
# ==============================================================================
# The TETE — Substack Automation & Editorial Studio CLI
# ==============================================================================

SUBSTACK_URL="https://thetete.substack.com"
DRAFT_URL="https://thetete.substack.com/publish/post"
NOTES_URL="https://thetete.substack.com/notes"
STUDIO_URL="http://localhost:4321"
FEED_URL="https://thetete.substack.com/feed"

show_help() {
  echo ""
  echo "🏺 The TETE — Substack Automation & CLI"
  echo "--------------------------------------------------------"
  echo "Usage: ./thetete.sh [command] [arguments]"
  echo ""
  echo "Commands:"
  echo "  studio                    Open the local Editorial Studio in your browser"
  echo "  sync                      Sync & fetch live profile & published posts from Substack"
  echo "  draft                     Open direct Substack Draft Post Editor"
  echo "  notes                     Open direct Substack Notes Composer"
  echo "  create-issue [topic]      Auto-generate a full 4-section newsletter + AI photo + 3 notes"
  echo "  generate [prompt]         Generate and download a free AI interior photo"
  echo "  schedule                  View automated editorial publication calendar"
  echo "  help                      Show this help message"
  echo ""
  echo "Examples:"
  echo "  ./thetete.sh sync"
  echo "  ./thetete.sh create-issue 'Why White Rooms Feel Cold: The Anti-Greige Manifesto'"
  echo "  ./thetete.sh generate 'warm minimalist oak and linen living room'"
  echo ""
}

case "$1" in
  studio)
    echo "✨ Opening The TETE Studio at $STUDIO_URL..."
    open "$STUDIO_URL" 2>/dev/null || xdg-open "$STUDIO_URL" 2>/dev/null
    ;;
  draft)
    echo "📋 Opening Substack Direct Post Draft at $DRAFT_URL..."
    open "$DRAFT_URL" 2>/dev/null || xdg-open "$DRAFT_URL" 2>/dev/null
    ;;
  notes)
    echo "✍️ Opening Substack Notes Composer at $NOTES_URL..."
    open "$NOTES_URL" 2>/dev/null || xdg-open "$NOTES_URL" 2>/dev/null
    ;;
  sync)
    echo "🔄 Syncing profile & published posts from Substack RSS ($FEED_URL)..."
    python3 -c "
import urllib.request, xml.etree.ElementTree as ET, json
try:
    req = urllib.request.Request('$FEED_URL', headers={'User-Agent': 'Mozilla/5.0'})
    xml_data = urllib.request.urlopen(req).read()
    root = ET.fromstring(xml_data)
    channel = root.find('channel')
    title = channel.find('title').text if channel.find('title') is not None else 'The TETE'
    desc = channel.find('description').text if channel.find('description') is not None else ''
    print(f'✅ Connected to: {title}')
    print(f'📖 Publication Tagline: {desc}')
    print('\n📚 Live Published Posts:')
    posts = []
    for idx, item in enumerate(channel.findall('item')):
        post_title = item.find('title').text
        post_link = item.find('link').text
        post_date = item.find('pubDate').text
        print(f'  [{idx+1}] {post_title} ({post_date[:16]})')
        print(f'      {post_link}')
        posts.append({'title': post_title, 'link': post_link, 'date': post_date})
    with open('published_posts.json', 'w') as f:
        json.dump(posts, f, indent=2)
    print('\n💾 Saved live posts data to ./published_posts.json')
except Exception as e:
    print('❌ Error syncing feed:', e)
"
    ;;
  create-issue)
    TOPIC="${2:-The Art of Quiet Rooms: Why Restraint Feels More Luxurious}"
    echo "🚀 Auto-assembling full 4-section newsletter for: '$TOPIC'..."
    mkdir -p drafts generated-photos
    DRAFT_FILE="drafts/issue_$(date +%Y%m%d_%H%M%S).md"
    
    cat << EOF > "$DRAFT_FILE"
# Issue Draft: $TOPIC
**Subject Line:** $TOPIC
**Preview Text:** What no one tells you about creating spaces that actually let you breathe.
**Author:** Tetiana (TE | INTERIOR & DECOR)
**Date:** $(date +"%B %d, %Y")

---

## 1. The Design Essay
Before I ever pull out a fabric swatch, open a paint deck, or talk about aesthetics, I ask my clients questions that sound almost aggressive in their mundanity:

Do you actually hang up your coats, or do they live on the banister until Sunday? When you cook, do you need silence, or is the TV on? Where does the mail actually land when you walk through the door?

Most people think interior design starts with a mood board. It doesn't. It starts with an audit of Tuesday mornings.

### The 3-Material Rule
Whenever a space feels sterile or clinical, introducing three tactile materials immediately warms it up:
1. **Washed Belgian Linen:** Absorbs acoustics and diffuses daylight.
2. **Aged White Oak / Walnut:** Introduces organic grain and grounding warmth.
3. **Unpolished Travertine / Terracotta:** Adds earthy geological texture.

---

## 2. Material & Object of the Week
**The &Tradition Formakami Paper Pendant**
- **Why It Works:** Merges traditional Japanese lantern craft with Scandinavian restraint. At 8 PM, turning off the overhead ceiling downlights and turning on a paper pendant feels like lighting a fireplace in the room.

---

## 3. Tuesday Morning Reality
I spent three hours yesterday talking a client out of buying a \$4,000 statement sofa they didn't love. They felt pressured by Pinterest to make a statement. The most luxurious rooms don't announce themselves—they just let you exhale the moment you step through the door.

---

## 4. Discussion Question for Subscribers
What is the one space in your home that works better on Pinterest than in your actual daily life? Reply to this email or leave a comment on the web!

Stay cozy & curious,
*xoxo,*
*tete*

---

### Substack Notes Pack (for this issue)
1. **Story:** "The biggest mistake I see with living rooms is designing for who you wish you were on Saturday night instead of who you actually are on Tuesday morning..."
2. **Contrarian:** "Stop looking for the 'perfect white paint.' It doesn't exist. There is only the right white for your light, at 4 PM in October..."
3. **Question:** "What's the one piece in your home that instantly makes you feel at ease?"
EOF
    echo "✅ Issue assembled and saved to: $DRAFT_FILE"
    
    # Generate image for issue
    echo "🎨 Generating matching hero photo..."
    ./thetete.sh generate "$TOPIC interior aesthetic warm linen oak"
    ;;
  generate)
    PROMPT="${2:-Washed oatmeal Belgian linen sofa in warm morning sunlight, natural oak table, ceramic vase, quiet luxury}"
    echo "🎨 Generating Free AI Interior Photo for prompt: '$PROMPT'..."
    mkdir -p generated-photos
    FILENAME="generated-photos/interior_$(date +%s).jpg"
    
    ENCODED=$(python3 -c "import urllib.parse, sys; print(urllib.parse.quote(sys.argv[1] + ', quiet luxury interior design, architectural digest magazine aesthetic, warm diffused natural light, high-end photography, 8k, photorealistic'))" "$PROMPT")
    IMAGE_URL="https://image.pollinations.ai/prompt/${ENCODED}?width=1280&height=720&model=flux-realism&nologo=true&seed=$RANDOM"
    
    curl -s -L -o "$FILENAME" "$IMAGE_URL"
    if [ -f "$FILENAME" ] && [ -s "$FILENAME" ]; then
      echo "✅ Saved high-res photo to: $FILENAME"
      open "$FILENAME" 2>/dev/null || true
    else
      echo "❌ Failed to download photo. URL: $IMAGE_URL"
    fi
    ;;
  schedule)
    echo "📅 The TETE Automated Publishing Cadence:"
    echo "--------------------------------------------------------"
    echo "• Tuesday 9:00 AM   : ✍️ Substack Note (Micro-Story or Tuesday Morning Audit)"
    echo "• Thursday 10:00 AM : 📰 Bi-Weekly Full Newsletter Issue (4 Sections + Hero Photo)"
    echo "• Saturday 11:00 AM : 💬 Substack Note (Subscriber Discussion & Q&A)"
    echo "• Sunday 6:00 PM    : 📸 Visual Photo Brief & Weekly Design Reflection"
    echo "--------------------------------------------------------"
    ;;
  *)
    show_help
    ;;
esac
