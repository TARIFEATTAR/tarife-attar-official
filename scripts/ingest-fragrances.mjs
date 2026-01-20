
import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, ...values] = line.split('=');
        if (key && values.length > 0) {
            const val = values.join('=').trim();
            process.env[key.trim()] = val;
        }
    });
}

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    token: process.env.SANITY_API_WRITE_TOKEN, // Use write token
    apiVersion: '2024-01-01',
    useCdn: false,
});

const data = {
    "territories": [
        {
            "_id": "territory-ember",
            "_type": "territory",
            "name": "EMBER",
            "slug": { "_type": "slug", "current": "ember" },
            "tagline": "The Intimacy of Ancient Routes",
            "description": "Spice. Warmth. The memory of caravans. Ember fragrances evoke the heat of distant markets, the amber glow of incense, the particular sweetness of places where the sun has permission to linger.",
            "keywords": ["Spice", "Warmth", "Incense", "Amber", "Resin"],
            "order": 1
        },
        {
            "_id": "territory-petal",
            "_type": "territory",
            "name": "PETAL",
            "slug": { "_type": "slug", "current": "petal" },
            "tagline": "The Exhale of Living Gardens",
            "description": "Bloom. Herb. The intelligence of green things. Petal fragrances capture flowers at their most alive—not the dried arrangements of potpourri but the wet vitality of gardens at dawn.",
            "keywords": ["Bloom", "Herb", "Floral", "Fresh", "Green"],
            "order": 2
        },
        {
            "_id": "territory-tidal",
            "_type": "territory",
            "name": "TIDAL",
            "slug": { "_type": "slug", "current": "tidal" },
            "tagline": "The Pull of Open Water",
            "description": "Salt. Mist. The liminal edge where land surrenders. Tidal fragrances occupy the threshold between solid and liquid, between knowing and dissolving.",
            "keywords": ["Salt", "Mist", "Aquatic", "Fresh", "Marine"],
            "order": 3
        },
        {
            "_id": "territory-terra",
            "_type": "territory",
            "name": "TERRA",
            "slug": { "_type": "slug", "current": "terra" },
            "tagline": "The Gravity of Deep Forests",
            "description": "Wood. Oud. The gravity of rooted things. Terra fragrances carry weight—not heaviness but substance, the kind of presence that comes from standing in forests older than human memory.",
            "keywords": ["Wood", "Oud", "Leather", "Earthy", "Musk"],
            "order": 4
        }
    ],
    "fragrances": [
        {
            "name": "ADEN",
            "legacyName": "Oud Fire",
            "territory": "territory-ember",
            "order": 1,
            "evocationPoint": { "location": "Aden, Yemen", "coordinates": "12.7797° N, 45.0365° E" },
            "evocation": ["Some cities exist as much in memory as in stone. Aden rises from volcanic rock at the throat of the Red Sea—a port that once moved more frankincense than any place on earth.", "This fragrance captures that threshold feeling: the moment a ship enters harbor after months at sea. Scorched sweetness. Resinous warmth. The sense that fire transforms rather than destroys.", "ADEN is an atmosphere, not a postcard. The oud at its center burns with volcanic energy, unapologetic and alive. But beneath the blaze lives something tender—honeyed, almost gentle."],
            "onSkin": ["Bergamot opens bright against geranium, while pink pepper adds spark. The heart unfolds into ambergris and patchouli, with violet tempering the warmth. The base grounds everything in clean musk, precious agarwood, and vanilla.", "This is oud rendered approachable—the initial brightness giving way to something unexpectedly tender. A warmth that clings to skin like whispered secrets."],
            "sillage": "Intimate yet present",
            "longevity": "8+ hours",
            "season": "Autumn fires, winter hearths",
            "notes": { "top": "Bergamot, Pink Pepper, Geranium", "heart": "Ambergris, Patchouli, Violet", "base": "Musk, Agarwood, Vanilla" },
            "fieldReport": { "concept": "A weathered copper vessel catches amber light through latticed shadows. Raw oud chips rest on a brass tray beside a sealed glass vial. Smoke curls from somewhere unseen.", "hotspots": [{ "_key": "h1", "item": "copper vessel", "meaning": "Traditional rendering tool" }, { "_key": "h2", "item": "amber light", "meaning": "Late afternoon, port city" }, { "_key": "h3", "item": "oud chips", "meaning": "The raw before the refined" }] }
        },
        {
            "name": "CARAVAN",
            "legacyName": "Honey Oud",
            "territory": "territory-ember",
            "order": 2,
            "evocationPoint": { "location": "Kandahar Province, Afghanistan", "coordinates": "31.6295° N, 65.7372° E" },
            "evocation": ["The Silk Road was never one road. It was ten thousand paths converging at caravanserais—walled courtyards where merchants rested and sealed their most precious cargo.", "CARAVAN captures that in-between state: the scent of goods improving in transit. Honey leaking onto oud, amber warming against skin across a thousand miles. Patience made aromatic.", "This is sweetness earned through labor. Golden and resinous, it carries every mile of the ancient road. Unhurried. Substantial. Comfort from taking the long way."],
            "onSkin": ["Golden honey meets precious agarwood in an opening that feels ancient and inevitable. Cinnamon warms while amber provides the golden glow. Vanilla wraps everything in comfort.", "Warm without being cloying, rich without being heavy. The kind of scent that makes strangers lean closer. Designed to be discovered, not announced."],
            "sillage": "Moderate, inviting",
            "longevity": "10+ hours",
            "season": "Year-round comfort",
            "notes": { "top": "Wild Honey, Cinnamon", "heart": "Agarwood, Amber, Light Florals", "base": "Vanilla, Leather" },
            "fieldReport": { "concept": "Golden hour light pools in an empty stone courtyard. A single honeycomb rests on weathered flagstone. Through an archway, the suggestion of endless road.", "hotspots": [{ "_key": "h1", "item": "honeycomb", "meaning": "Sweetness as preservation" }, { "_key": "h2", "item": "archway", "meaning": "The promise of distance" }, { "_key": "h3", "item": "flagstone", "meaning": "A thousand years of footsteps" }] }
        },
        {
            "name": "MARRAKESH",
            "legacyName": null,
            "territory": "territory-ember",
            "order": 3,
            "evocationPoint": { "location": "Jemaa el-Fnaa, Morocco", "coordinates": "31.6295° N, 7.9811° W" },
            "evocation": ["Follow the smell and you will find the tanneries. In the medina, where leather merchants have worked since the 11th century, the air hangs thick with a scent unchanged for a thousand years.", "MARRAKESH captures the alchemy of the Chouara—not the first recoil, but the deeper understanding. Leather at its most honest, surrounded by spices. Plum sweetness. Cardamom lifting.", "This fragrance does not apologize for its complexity. Like Marrakesh itself, it asks you to stay long enough to understand."],
            "onSkin": ["Plum and cardamom open with unexpected sweetness, while lavender and bergamot add brightness. The heart reveals nutmeg, rose, cinnamon, cumin, violet and jasmine. The base is where the tanneries live—leather, agarwood, incense, cedar, patchouli, amber.", "A very leathery scent—reminiscent of the leather merchants in Morocco. Warm, spicy, fresh, smoky, woody, with hints of fruit and agarwood depth."],
            "sillage": "Present, substantial",
            "longevity": "10+ hours",
            "season": "Cool evenings, year-round",
            "notes": { "top": "Plum, Cardamom, Lavender, Bergamot, Green Notes", "heart": "Nutmeg, Rose, Cinnamon, Cumin, Violet, Jasmine", "base": "Leather, Agarwood, Incense, Cedar, Patchouli, Amber, Balsamic" },
            "fieldReport": { "concept": "The honey-colored walls of the tannery courtyard, vats of dye arranged in ancient geometry. Morning light catches leather hides drying on rooftops.", "hotspots": [{ "_key": "h1", "item": "dye vats", "meaning": "Ancient colors, living tradition" }, { "_key": "h2", "item": "drying hides", "meaning": "Transformation in progress" }, { "_key": "h3", "item": "honey walls", "meaning": "The medina holds its secrets" }] }
        },
        {
            "name": "ETHIOPIA",
            "legacyName": "Frankincense & Myrrh",
            "territory": "territory-ember",
            "order": 4,
            "evocationPoint": { "location": "Lalibela, Ethiopia", "coordinates": "9.0400° N, 38.7469° E" },
            "evocation": ["In the highlands of northern Ethiopia, eleven churches stand that were not built but carved—excavated downward into living rock in the 12th century by devotion so complete it moved mountains.", "ETHIOPIA captures that quality of sacred labor—frankincense and myrrh as they have burned in Ethiopian Orthodox liturgy for over a thousand years. The softer truth of materials warmed by centuries of prayer.", "The sacred does not announce itself. It settles quietly into the room, into the skin, and changes the quality of attention. A centering presence that asks nothing but offers everything."],
            "onSkin": ["Frankincense opens with characteristic brightness—citrus and pine before the resin reveals itself. Myrrh joins with bittersweet depth. Labdanum adds amber warmth while cedarwood provides architecture. Benzoin softens everything.", "This is perfume oil—frankincense and myrrh joined by labdanum, cedarwood, and benzoin. The sacred settling quietly, changing the quality of attention."],
            "sillage": "Moderate, meditative",
            "longevity": "6-8 hours",
            "season": "Contemplative moments, any season",
            "notes": { "top": "Citrus Frankincense, Pine Resin", "heart": "Olibanum, Myrrh, Labdanum", "base": "Cedarwood, Benzoin" },
            "fieldReport": { "concept": "Stone walls carved from living rock. A single shaft of light falling into the depths of Bete Giyorgis. Incense smoke rising toward impossible geometry.", "hotspots": [{ "_key": "h1", "item": "carved stone", "meaning": "Devotion as removal, as making space" }, { "_key": "h2", "item": "shaft of light", "meaning": "The sacred finding its way in" }, { "_key": "h3", "item": "rising smoke", "meaning": "Prayer made visible" }] }
        },
        {
            "name": "GRANADA",
            "legacyName": "Granada Amber",
            "territory": "territory-ember",
            "order": 5,
            "evocationPoint": { "location": "Albaicín, Granada, Spain", "coordinates": "37.1773° N, 3.5986° W" },
            "evocation": ["The Albaicín climbs the hill opposite the Alhambra, its white walls and hidden gardens a living record of Moorish Granada. Walk these alleys in evening and the old quarter reveals what it holds.", "GRANADA captures that specific warmth—amber in its truest sense. Not bright, not sharp, but deep and enveloping. Essentially liquid amber: warm, woody, sweet, substantial.", "The Moors called this place the last sigh. Beauty that knows its own impermanence, sweetness that contains its own shadow."],
            "onSkin": ["Warm amber opens immediately—no preamble, no apology. Deep, resinous, glowing from within. Woody notes provide structure while vanilla adds sweetness that never cloys. The amber accord persists and persists.", "It envelops you like the Albaicín climbing the hill opposite the Alhambra. A fragrance that seems to understand impermanence—beauty that releases gracefully, but leaves its warmth behind."],
            "sillage": "Soft, enveloping",
            "longevity": "8+ hours",
            "season": "Cool evenings, warm nights",
            "notes": { "top": "Warm Amber", "heart": "Woody Notes, Sweet Amber Accord", "base": "Vanilla, Deep Amber" },
            "fieldReport": { "concept": "Evening in the Albaicín. White walls catching the last amber light. Through an archway, the red towers of Alhambra in soft focus.", "hotspots": [{ "_key": "h1", "item": "white walls", "meaning": "Moorish geometry beneath the surface" }, { "_key": "h2", "item": "amber light", "meaning": "The glow of memory" }, { "_key": "h3", "item": "Alhambra shadow", "meaning": "The view from what was lost" }] }
        },
        {
            "name": "HAVANA",
            "legacyName": "Oud & Tobacco",
            "territory": "territory-ember",
            "order": 6,
            "evocationPoint": { "location": "Habana Vieja, Cuba", "coordinates": "23.1136° N, 82.3666° W" },
            "evocation": ["The crumbling glory of Habana Vieja exists in permanent golden hour—the light somehow always amber, always forgiving, turning decay into romance. Tobacco leaves hang in doorways to dry.", "HAVANA captures that specific decadence: tobacco not as smoke but as leaf, honeyed and slightly fermented. Woody tobacco with boozy warmth—like whiskey aged in salt air.", "The sweetness here is not innocent. It knows what it is doing. Smoky and beautiful, truly unisex, capturing crumbling glory in permanent golden hour."],
            "onSkin": ["Agarwood and tobacco open with woody warmth, neither apologizing. A boozy whiskey accord adds decadence. Vanilla strings through everything, and smoky notes linger like the best Havana evenings.", "The sweetness knows exactly what it is doing: warm, slightly dangerous, impossibly inviting. A fragrance for late afternoons that become late evenings."],
            "sillage": "Warm, present",
            "longevity": "8+ hours",
            "season": "Evening, year-round",
            "notes": { "top": "Agarwood, Tobacco", "heart": "Boozy Whiskey Accord, Sweet Amber, Balsamic", "base": "Vanilla, Woody Notes, Smoky Accord" },
            "fieldReport": { "concept": "Tobacco leaves hanging in a doorway, backlit by afternoon sun. A weathered bar counter with rum bottles. Through a window, the suggestion of ocean.", "hotspots": [{ "_key": "h1", "item": "tobacco leaves", "meaning": "Drying, not burning" }, { "_key": "h2", "item": "rum bottles", "meaning": "Añejo, patient sweetness" }, { "_key": "h3", "item": "window light", "meaning": "Permanent golden hour" }] }
        },
        {
            "name": "DUNE",
            "legacyName": "Vanilla Sands",
            "territory": "territory-ember",
            "order": 7,
            "evocationPoint": { "location": "Liwa Oasis, UAE", "coordinates": "23.4162° N, 55.4344° E" },
            "evocation": ["At the edge of the Empty Quarter, the dunes reach heights that defy belief. Orange and rose-gold, they shift with the wind, creating a landscape never the same twice. The desert as meditation.", "DUNE captures not the harshness of sand but its strange softness—the way it absorbs light and sound. At its heart is vanilla: sophisticated, slightly woody, never cloying.", "There is something clarifying about vast emptiness. DUNE offers that same gift: a scent that strips away noise and leaves only the essential."],
            "onSkin": ["Sweet caramel vanilla opens with immediate warmth—sophisticated, not saccharine. Slight woody accords keep the sweetness grounded. The base settles into mild amber and clean musk.", "Very beautiful, classic, and long-lasting. A scent that strips away noise and leaves only the essential. Creamy wood, warm skin, the faintest memory of wind."],
            "sillage": "Close, centering",
            "longevity": "10+ hours",
            "season": "Year-round, evening ritual",
            "notes": { "top": "Sweet Caramel Vanilla", "heart": "Woody Accords", "base": "Mild Amber, Musk, Benzoin" },
            "fieldReport": { "concept": "Dunes at the magic hour—rose-gold and seemingly infinite. A single ripple of wind-sculpted sand in perfect focus. The shadow is long, the light impossibly soft.", "hotspots": [{ "_key": "h1", "item": "dune ridge", "meaning": "Wind-sculpted, temporary" }, { "_key": "h2", "item": "rose-gold light", "meaning": "The Empty Quarter at peace" }, { "_key": "h3", "item": "long shadow", "meaning": "The hour of softness" }] }
        },
        {
            "name": "DAMASCUS",
            "legacyName": "Turkish Rose",
            "territory": "territory-petal",
            "order": 1,
            "evocationPoint": { "location": "Isparta, Turkey", "coordinates": "37.7556° N, 30.5566° E" },
            "evocation": ["Every May, the rose fields of Isparta bloom in waves of pink. But the roses must be harvested before dawn—once the sun touches them, their precious oils begin to evaporate.", "DAMASCUS captures the rose at that hour: cool and dewy, not yet warmed by sun. This is not the jammy, overripe rose. It is cleaner, greener, with a sharpness that speaks of morning frost.", "The Damask rose has been cultivated for its oil for over a thousand years. DAMASCUS carries that lineage lightly—not as burden, but as blessing."],
            "onSkin": ["Rose otto and Bulgarian rose open with the freshness of dawn-picked petals—cool, dewy, still holding the chill of mountain night. Woody notes provide structure while fresh accords keep everything bright.", "There is a specific kind of freshness here that is hard to find in rose fragrances. It is the green stem as much as the pink petal, the dew as much as the bloom."],
            "sillage": "Radiant but refined",
            "longevity": "8+ hours",
            "season": "Spring awakening, crisp days",
            "notes": { "top": "Rose Otto, Fresh Accords", "heart": "Bulgarian Rose, Green Stem", "base": "Woody Notes, Clean Musk" },
            "fieldReport": { "concept": "Rose fields before dawn, rows of pink disappearing into darkness. A single bloom in focus, dew still clinging. The first hint of light on the eastern hills.", "hotspots": [{ "_key": "h1", "item": "dew-covered rose", "meaning": "The moment before sun" }, { "_key": "h2", "item": "eastern light", "meaning": "Minutes until harvest ends" }, { "_key": "h3", "item": "basket", "meaning": "Traditional gathering" }] }
        },
        {
            "name": "JASMINE",
            "legacyName": "Arabian Jasmine",
            "territory": "territory-petal",
            "order": 2,
            "evocationPoint": { "location": "Grasse, France", "coordinates": "43.6107° N, 6.9273° E" },
            "evocation": ["Grasse calls itself the perfume capital of the world, but what makes it special is not technique—it is terroir. The jasmine that grows in these hills has a richness that flowers elsewhere cannot match.", "JASMINE captures that particular intensity: honeyed and narcotic, with a darkness beneath the sweetness that hints at the night-blooming nature. Something confessional about it.", "This is not delicate jasmine. This is jasmine at full power: intoxicating, slightly dangerous, impossible to ignore."],
            "onSkin": ["A very beautiful blend of jasmine and sambac opens with bright, fresh intensity—capturing the flower at its most intoxicating. Classic jasmine accords weave through, honeyed and narcotic.", "Intoxicating without apology. The kind of fragrance that changes the energy of a room without anyone knowing why."],
            "sillage": "Present, undeniable",
            "longevity": "10+ hours",
            "season": "Warm evenings, any time you need power",
            "notes": { "top": "Jasmine, Bright Fresh Accords", "heart": "Sambac, Jasmine Absolute", "base": "White Musk, Soft Woods" },
            "fieldReport": { "concept": "Jasmine vines climbing a stone wall at twilight. White flowers glowing against darkening sky. A single picker's basket, overflowing.", "hotspots": [{ "_key": "h1", "item": "white blooms", "meaning": "Opening as the sun sets" }, { "_key": "h2", "item": "stone wall", "meaning": "Mediterranean terroir" }, { "_key": "h3", "item": "picker's basket", "meaning": "Hand-harvested tradition" }] }
        },
        {
            "name": "TAHARA",
            "legacyName": "Musk Tahara",
            "territory": "territory-petal",
            "order": 3,
            "evocationPoint": { "location": "Medina, Saudi Arabia", "coordinates": "24.5247° N, 39.5692° E" },
            "evocation": ["In Arabic, tahara means purity—specifically, the ritual cleanliness required before prayer. A state of being more than a physical condition: clear-minded, clear-hearted, ready to approach the sacred.", "TAHARA captures that quality of readiness. This is musk stripped of all animal associations, all heaviness, all complexity. What remains is something like clean cotton, like a room aired after prayer.", "There is a specific kind of peace in simplicity. Not emptiness—fullness that has been organized, clarified, made spacious. TAHARA offers that gift."],
            "onSkin": ["Powdery white musk opens with immediate softness—clean, pillowy, almost abstract. Light florals emerge gently: lily, violet, rose, never demanding attention.", "TAHARA does not fill space—it clears it. A scent that creates room rather than taking it up, that offers the specific peace of simplicity."],
            "sillage": "Soft, second-skin",
            "longevity": "All day",
            "season": "Year-round, daily ritual",
            "notes": { "top": "Powdery White Musk", "heart": "Light Florals, Lily, Violet, Rose", "base": "Very Subtle Vanilla, Light Musk" },
            "fieldReport": { "concept": "Morning light through a simple window. White linen, freshly laundered. A single bar of soap, unbranded. The moment after the bath, before the day begins.", "hotspots": [{ "_key": "h1", "item": "window light", "meaning": "Clean, unfiltered" }, { "_key": "h2", "item": "white linen", "meaning": "Simplicity as luxury" }, { "_key": "h3", "item": "soap bar", "meaning": "Essential, nothing more" }] }
        },
        {
            "name": "CHERISH",
            "legacyName": "Peach Memoir",
            "territory": "territory-petal",
            "order": 4,
            "evocationPoint": { "location": "Umbria, Italy", "coordinates": "42.9849° N, 12.3706° E" },
            "evocation": ["The hills of Umbria roll green and gold through central Italy, softer than Tuscany, less discovered, holding their secrets closer. In summer, the orchards release a particular sweetness.", "CHERISH captures that ephemeral sweetness. This is not the syrupy peach of candies, but the real fruit—slightly fuzzy, slightly tart, entirely sophisticated.", "There is something nostalgic here—kid gloves and linen closets, letters tied with ribbon, the sense of being cared for by someone who knew exactly what mattered."],
            "onSkin": ["Peach and apple blossom open with sophisticated fruitiness—nothing cloying, everything real. Pineapple blossom adds an unexpected tropical whisper. Wild rose, clean musk, and patchouli at the base.", "A very beautiful, sophisticated peach scent. Slightly musky, slightly powdery. The quiet opulence of materials that reveal themselves only to those paying attention."],
            "sillage": "Close, intimate",
            "longevity": "8+ hours",
            "season": "Spring, summer, elegant occasions",
            "notes": { "top": "Peach, Apple Blossom", "heart": "Pineapple Blossom", "base": "Wild Rose, Musk, Patchouli" },
            "fieldReport": { "concept": "An orchard in Umbria, morning light filtering through leaves. A single perfect peach in focus, still on the branch. The moment before the picking.", "hotspots": [{ "_key": "h1", "item": "perfect peach", "meaning": "Ripeness as revelation" }, { "_key": "h2", "item": "filtered light", "meaning": "Umbria's soft mornings" }, { "_key": "h3", "item": "harvest basket", "meaning": "Gathering what matters" }] }
        },
        {
            "name": "RITUAL",
            "legacyName": "White Egyptian Musk",
            "territory": "territory-petal",
            "order": 5,
            "evocationPoint": { "location": "Luxor, Egypt", "coordinates": "25.6872° N, 32.6396° E" },
            "evocation": ["On the banks of the Nile, where the Valley of the Kings holds its ancient dead and the Temple of Karnak still stands after four thousand years, the rituals of adornment have never really stopped.", "RITUAL captures that daily devotion. This is white musk at its most elegant—clean and subtle. ISO E Super provides that woody, almost-not-there presence. Ambroxan adds its particular magic.", "A very beautiful skin scent that can be worn all day, every day. Not the musk of seduction or statement, but the musk of self-possession."],
            "onSkin": ["ISO E Super opens with characteristic woody transparency—there and not there, felt more than smelled. Light musk provides the softest foundation while Ambroxan adds unique radiance.", "A very beautiful skin scent that can be worn all day, every day. Clean and subtle, embodying the quiet elegance of ritual—the daily practice of adorning oneself with intention."],
            "sillage": "Whisper-close, second-skin",
            "longevity": "All day",
            "season": "Year-round, daily wear",
            "notes": { "top": "ISO E Super, Aldehydes", "heart": "Light Musk, Ambroxan", "base": "White Amber, Skin Musk" },
            "fieldReport": { "concept": "Morning light on ancient stone. A simple vessel of oil waiting. The moment of preparation, before the world begins its demands.", "hotspots": [{ "_key": "h1", "item": "oil vessel", "meaning": "The daily sacred" }, { "_key": "h2", "item": "morning light", "meaning": "Ritual as renewal" }, { "_key": "h3", "item": "ancient stone", "meaning": "Four thousand years of intention" }] }
        },
        {
            "name": "BAHIA",
            "legacyName": "Coconut Jasmine",
            "territory": "territory-petal",
            "order": 6,
            "evocationPoint": { "location": "Salvador, Bahia, Brazil", "coordinates": "12.9714° S, 38.5014° W" },
            "evocation": ["Salvador de Bahia is where Africa met the Americas and decided to stay. The city runs on candomblé rhythms and coconut water, its streets paved in Portuguese stone but its soul decidedly Yoruba.", "BAHIA captures that particular joy: coconut and jasmine, with vanilla warmth and frangipani's exotic sweetness. This is not a tropical cliché—it is more complex, more grounded.", "There is a specific kind of happiness that comes from places where cultures mix without hierarchy—where everything borrowed becomes something new."],
            "onSkin": ["Coconut opens creamy and fresh, joined immediately by vanilla's warm embrace. Jasmine adds heady sweetness while frangipani brings the tropics without cliché.", "This is not a tropical cliché. There is sophistication beneath the sunny exterior—complexity earned through the meeting of worlds."],
            "sillage": "Radiant, sunny",
            "longevity": "6-8 hours",
            "season": "Summer days, vacation energy, joy",
            "notes": { "top": "Coconut, Jasmine", "heart": "Vanilla, Frangipani", "base": "Very Light Musk" },
            "fieldReport": { "concept": "Cobblestone street in the Pelourinho, sun-dappled. Coconut and lime on a ceramic plate. Tropical flowers spilling from a window box. Drums distant but present.", "hotspots": [{ "_key": "h1", "item": "cobblestones", "meaning": "Portuguese foundation" }, { "_key": "h2", "item": "coconut", "meaning": "Africa's gift to Brazil" }, { "_key": "h3", "item": "distant drums", "meaning": "Axé in everything" }] }
        },
        {
            "name": "DUBAI",
            "legacyName": "Dubai Musk",
            "territory": "territory-tidal",
            "order": 1,
            "evocationPoint": { "location": "Dubai Creek, UAE", "coordinates": "25.2048° N, 55.2708° E" },
            "evocation": ["Before the towers, there was the Creek. A tidal inlet where dhows still dock as they have for centuries. Walk the souks at dusk and you will find what Dubai was before it became what it is.", "DUBAI captures that original character—the soft power of the Gulf before glass and steel. A very light and airy scent—a sister to Tahara, but lighter, sweeter, and somewhat fresh.", "There is a specific hour here, just after sunrise, when the Creek empties of its nighttime stillness and the air grows fresh with salt and possibility."],
            "onSkin": ["Light sweet rose opens with subtle hints of apple—fresh, bright, unexpected. The heart reveals light musk that floats rather than clings, aquatic and airy.", "Pillowy musk draped in rose—the soft power of Gulf morning. This is lightness itself: intimate, fresh, never shouting."],
            "sillage": "Close, floating",
            "longevity": "6-8 hours",
            "season": "Year-round, layering base",
            "notes": { "top": "Light Sweet Rose, Subtle Apple", "heart": "Light Musk, Aquatic Accord", "base": "Vanilla, Light Amber" },
            "fieldReport": { "concept": "Dubai Creek at dawn. A dhow's wooden bow catching first light. Mist lifting off the water. The city's towers visible but distant.", "hotspots": [{ "_key": "h1", "item": "dhow bow", "meaning": "Century-old trade routes" }, { "_key": "h2", "item": "morning mist", "meaning": "The hour of possibility" }, { "_key": "h3", "item": "distant towers", "meaning": "What came after" }] }
        },
        {
            "name": "DELMAR",
            "legacyName": null,
            "territory": "territory-tidal",
            "order": 2,
            "evocationPoint": { "location": "Amalfi Coast, Italy", "coordinates": "40.6501° N, 14.6015° E" },
            "evocation": ["The Amalfi Coast was never supposed to support life—all vertical cliff and thin soil, lemon terraces carved into rock by centuries of stubborn agriculture.", "DELMAR captures that tension between harsh and lush, between salt and sweet. A very fresh, realistic scent of salty ocean—the liminal edge where the cliff meets the sea.", "The coast does not care about productivity. It exists where it wants, blooms when it is ready. DELMAR carries that same energy: unhurried, generous, unconcerned with performance."],
            "onSkin": ["Bergamot and lemon open with Mediterranean brightness, immediately joined by the realistic salt of seaweed. Hedione provides jasmine-tinged airiness while Ambroxan adds its magic.", "DELMAR does not perform. It exists. There is a generosity here that cannot be manufactured: the freshness of salt air, the warmth of sun-baked stone."],
            "sillage": "Soft, enveloping",
            "longevity": "6-8 hours",
            "season": "Summer, coastal energy",
            "notes": { "top": "Bergamot, Lemon, Seaweed", "heart": "Hedione, Marine Accord", "base": "Ambroxan, Cedar, Musk" },
            "fieldReport": { "concept": "The Amalfi cliffs at midday. Sea visible through lemon branches, impossibly blue. Salt spray catching the light. A worn path leading down to water.", "hotspots": [{ "_key": "h1", "item": "lemon branches", "meaning": "Stubborn beauty" }, { "_key": "h2", "item": "sea glimpse", "meaning": "Always present" }, { "_key": "h3", "item": "worn path", "meaning": "The way down to the edge" }] }
        },
        {
            "name": "BAHRAIN",
            "legacyName": "Blue Oud",
            "territory": "territory-tidal",
            "order": 3,
            "evocationPoint": { "location": "Bahrain Pearl Diving Coast", "coordinates": "26.2041° N, 50.5515° E" },
            "evocation": ["Before oil, there was pearl. For four thousand years, Bahraini divers descended into the Gulf, holding their breath for minutes at a time, hunting oysters in waters so warm they were nearly body-temperature.", "The new Bahrain moves faster—chrome speedboats cutting across the same waters where wooden dhows once drifted. BAHRAIN captures both: the ancient depth and the modern velocity.", "There is something meditative about going under. And there is something exhilarating about breaking the surface. BAHRAIN offers both: depth and velocity, patience and power."],
            "onSkin": ["Fresh ozonic notes open with immediate velocity—metallic, bright, the chrome of modern Gulf luxury. Woody notes provide structure, almost steel-like in their precision. Marine accords weave through.", "A fragrance that moves—from depth to surface, from contemplation to exhilaration. Very fresh, woody, with ozonic notes and marine accords."],
            "sillage": "Fresh, dynamic",
            "longevity": "8+ hours",
            "season": "Year-round, particularly summer",
            "notes": { "top": "Ozonic Notes, Metallic Accord", "heart": "Fresh Woods, Marine Accord", "base": "Warm Musk, Ambergris Accord" },
            "fieldReport": { "concept": "Split image: underwater light, golden and diffused, a pearl resting on a diving stone. Above: chrome bow of a speedboat cutting through Gulf waters.", "hotspots": [{ "_key": "h1", "item": "pearl", "meaning": "Four thousand years of seeking" }, { "_key": "h2", "item": "chrome bow", "meaning": "Modern velocity" }, { "_key": "h3", "item": "Gulf waters", "meaning": "The constant beneath change" }] }
        },
        {
            "name": "KYOTO",
            "legacyName": "China Rain",
            "territory": "territory-tidal",
            "order": 4,
            "evocationPoint": { "location": "Arashiyama, Kyoto, Japan", "coordinates": "35.0116° N, 135.7681° E" },
            "evocation": ["The bamboo groves of Arashiyama sway above a river that has flowed past temples for over a thousand years. In spring, cherry blossoms fall onto the water and float downstream.", "KYOTO captures that transient grace: a very classic scent—China Rain—with its unmistakable petrichor quality. Very beautiful, fresh, with that sense of water lily and light musk.", "The genius of Japanese aesthetics is knowing when to stop—restraint not as limitation but as refinement. KYOTO carries that same lightness."],
            "onSkin": ["Light green top notes open with the freshness of bamboo after rain. Petrichor—that specific scent of rain on warm stone—defines the heart, joined by water lily's soft aquatic character.", "KYOTO does not try to hold on. It opens, releases, trusts the current. A fragrance for those who understand that the most beautiful things are also the most temporary."],
            "sillage": "Whisper-soft",
            "longevity": "4-6 hours (intentionally fleeting)",
            "season": "Spring, transitional moments",
            "notes": { "top": "Light Green Notes, Fresh Accords", "heart": "Petrichor, Water Lily", "base": "Light Musk, White Lily, Very Light Rose" },
            "fieldReport": { "concept": "Cherry blossoms floating on still river water. Bamboo grove reflected, softly blurred. A single petal in perfect focus.", "hotspots": [{ "_key": "h1", "item": "floating petals", "meaning": "Mono no aware" }, { "_key": "h2", "item": "bamboo reflection", "meaning": "A thousand years of whispers" }, { "_key": "h3", "item": "still water", "meaning": "The mirror of attention" }] }
        },
        {
            "name": "OMAN",
            "legacyName": "Teeb Musk",
            "territory": "territory-tidal",
            "order": 5,
            "evocationPoint": { "location": "Muscat, Oman", "coordinates": "23.5880° N, 58.3829° E" },
            "evocation": ["Oman carries a quiet dignity that sets it apart from its Gulf neighbors. Where others built spectacle, Oman built substance—understated luxury, hospitality so refined it feels effortless.", "OMAN captures that philosophy of restraint. This is musk as the Omanis understand it: not a statement but a whisper, not a projection but a presence. Clean mountain air from the Hajar range.", "The Omani believe that a guest should smell you only when close enough to embrace. OMAN honors that intimacy—a skin scent in the truest sense."],
            "onSkin": ["Eucalyptus opens with clean brightness—not medicinal but fresh, like mountain air. Green tea and mint add coolness while fresh clean accords define the heart.", "Oman carries a quiet dignity—understated luxury without spectacle. A scent that clears the air rather than filling it, creating space rather than taking it up."],
            "sillage": "Close, personal",
            "longevity": "6+ hours",
            "season": "Year-round, daily wear",
            "notes": { "top": "Eucalyptus, Green Tea", "heart": "Mint, Fresh Clean Accords", "base": "Light Woods, White Musk" },
            "fieldReport": { "concept": "Morning in Muscat. The Hajar mountains visible through clear air. White architecture against blue sky. The simplicity of a culture that does not need to prove anything.", "hotspots": [{ "_key": "h1", "item": "Hajar mountains", "meaning": "Clean air descending" }, { "_key": "h2", "item": "white architecture", "meaning": "Omani restraint" }, { "_key": "h3", "item": "clear sky", "meaning": "Nothing hidden" }] }
        },
        {
            "name": "REGATTA",
            "legacyName": null,
            "territory": "territory-tidal",
            "order": 6,
            "evocationPoint": { "location": "Cowes, Isle of Wight, UK", "coordinates": "50.7089° N, 1.2915° W" },
            "evocation": ["Cowes has been the seat of British sailing since the sport existed—a small town on the Isle of Wight where yacht clubs line the waterfront and the sea is never out of sight.", "REGATTA captures that tradition: nautical without being literal, fresh without being cold, touched by the leather and tobacco of the afterparty. Old money worn casually.", "The English relationship with the sea is stoic, understated, slightly damp. REGATTA carries that same energy: crisp and capable, never flashy."],
            "onSkin": ["Sea salt and bergamot open with immediate freshness, joined by grapefruit's bright lift. Marine accord and cardamom define the heart, with lavender adding a touch of English garden.", "REGATTA carries the quiet confidence of old expertise: nothing to prove, everything to offer. For those who prefer to earn respect through consistency."],
            "sillage": "Fresh, present",
            "longevity": "6-8 hours",
            "season": "Spring through fall, professional settings",
            "notes": { "top": "Sea Salt, Bergamot, Grapefruit", "heart": "Marine Accord, Cardamom, Lavender", "base": "Ambergris Accord, Leather, Oakmoss" },
            "fieldReport": { "concept": "Yacht club morning—brass fittings catching fog-filtered light. Coiled rope on worn teak. Through the window, white sails on grey water.", "hotspots": [{ "_key": "h1", "item": "brass fittings", "meaning": "Polished by habit" }, { "_key": "h2", "item": "coiled rope", "meaning": "Everything in its place" }, { "_key": "h3", "item": "grey water", "meaning": "The Solent, eternal" }] }
        },
        {
            "name": "REGALIA",
            "legacyName": "Oud Aura",
            "territory": "territory-terra",
            "order": 1,
            "evocationPoint": { "location": "Sabah, Malaysian Borneo", "coordinates": "5.9788° N, 116.0753° E" },
            "evocation": ["The forests of Borneo are among the oldest on earth—130 million years of unbroken evolution, creating trees that dwarf cathedrals. Here the Aquilaria trees grow and produce oud.", "REGALIA captures oud at its most refined—a very rich Hindi oud. Not the barnyard funk of young wood, but the clean, animalic elegance that develops with time. Leather and smoky notes.", "There is a reason oud has been called the wood of the gods. Something about its density, its willingness to transform trauma into beauty, speaks to human aspiration."],
            "onSkin": ["Hindi oud opens with its full character—animalic, smoky, commanding. Leather joins immediately. Musky depth and hints of vanilla soften without sweetening.", "REGALIA does not apologize for its presence. This is fragrance as gravity: grounding, substantial, deserving of space."],
            "sillage": "Present, commanding",
            "longevity": "12+ hours",
            "season": "Evening, significant occasions",
            "notes": { "top": "Hindi Oud, Leather", "heart": "Smoky Accord, Animalic Musk", "base": "Vanilla Hints, Woody Notes, Powder" },
            "fieldReport": { "concept": "Oud chips arranged on dark wood, lit by a single shaft of forest light. The suggestion of vast trees beyond. Smoke curling from somewhere unseen.", "hotspots": [{ "_key": "h1", "item": "oud chips", "meaning": "Decades of patient transformation" }, { "_key": "h2", "item": "forest light", "meaning": "Cathedral darkness, broken" }, { "_key": "h3", "item": "distant smoke", "meaning": "The eternal rendering" }] }
        },
        {
            "name": "RIYADH",
            "legacyName": "Black Oudh",
            "territory": "territory-terra",
            "order": 2,
            "evocationPoint": { "location": "Riyadh Oud Souks, Saudi Arabia", "coordinates": "24.7136° N, 46.6753° E" },
            "evocation": ["Riyadh rises from the desert like a denial of nature—glass and steel where nothing should grow. But in the old souks, the ancient trade continues. Oud stalls lined with dark woods.", "RIYADH captures that duality: a slightly rose oud—executive and sophisticated. More on the masculine side, this is oud dressed for the modern world.", "The Saudi relationship with oud is intimate—worn daily, burned constantly, gifted with care. RIYADH honors that tradition while translating it for newcomers."],
            "onSkin": ["Rose oud opens with sophistication—floral and woody in perfect balance. Fresh and spicy citrus notes add brightness while musk provides the backbone.", "RIYADH could walk into a boardroom. It could also find an oasis in empty sand. For those who want oud without the learning curve."],
            "sillage": "Refined, present",
            "longevity": "10+ hours",
            "season": "Year-round sophistication",
            "notes": { "top": "Rose Oud, Spicy Citrus", "heart": "Fresh Woods, Floral Notes", "base": "Musk, Amber" },
            "fieldReport": { "concept": "Modern Riyadh visible through a souk archway. In the foreground, traditional oud chips on a brass scale. The coexistence of glass towers and ancient trade.", "hotspots": [{ "_key": "h1", "item": "souk archway", "meaning": "The threshold between worlds" }, { "_key": "h2", "item": "brass scale", "meaning": "Worth measured in tradition" }, { "_key": "h3", "item": "glass towers", "meaning": "The new Arabia, watching" }] }
        },
        {
            "name": "SICILY",
            "legacyName": "Sicilian Oudh",
            "territory": "territory-terra",
            "order": 3,
            "evocationPoint": { "location": "Mount Etna, Sicily", "coordinates": "37.5994° N, 14.0154° E" },
            "evocation": ["Mount Etna has been erupting for 500,000 years. The Sicilians who farm its slopes know the volcano as they know a difficult parent: unpredictable, sometimes destructive, but ultimately the source of life.", "SICILY captures that productive danger: Sicilian bergamot opens bright against pink pepper. Davana adds fruity depth while agarwood provides the volcanic heart.", "Living near volcanoes teaches a particular philosophy: enjoy what you have while you have it, because the earth makes no promises."],
            "onSkin": ["Sicilian bergamot opens with Mediterranean brightness, joined by pink pepper and davana. Agarwood provides the volcanic heart while white amber glows. Haitian vetiver smokes through the base.", "SICILY offers the philosophy of people who live near volcanoes: enjoy what you have while you have it. Generous, warm, and perfectly aware that nothing lasts forever."],
            "sillage": "Warm, embracing",
            "longevity": "8+ hours",
            "season": "Cool evenings, winter warmth",
            "notes": { "top": "Sicilian Bergamot, Pink Pepper, Davana", "heart": "Agarwood, White Amber, Rosemary", "base": "Leather, Musk, Haitian Vetiver" },
            "fieldReport": { "concept": "Mount Etna smoking in the background, peaceful for now. Citrus groves in the middle distance. The fertility that danger provides.", "hotspots": [{ "_key": "h1", "item": "smoking Etna", "meaning": "The source of richness" }, { "_key": "h2", "item": "citrus grove", "meaning": "Growth from destruction" }, { "_key": "h3", "item": "golden light", "meaning": "The hour of gratitude" }] }
        },
        {
            "name": "OBSIDIAN",
            "legacyName": "Black Musk",
            "territory": "territory-terra",
            "order": 4,
            "evocationPoint": { "location": "Teotihuacan, Mexico", "coordinates": "19.4326° N, 99.1332° W" },
            "evocation": ["Before the Aztecs, before the Maya, there was Teotihuacan—a city that housed 125,000 people when Rome was at its height, then was mysteriously abandoned.", "OBSIDIAN captures that ancient darkness: a very dark musk—beautiful and resinous. Dark musk with volcanic depth, sweet but serious, warm but weighted.", "Some beauty does not ask to be understood. OBSIDIAN carries that energy: present without performing, powerful without explaining."],
            "onSkin": ["Dark musk opens with immediate depth—no preamble, no apology. Ambrette adds its seed-like warmth while myrrh provides ancient resinous character.", "OBSIDIAN is comfortable with its own mystery. Present without performing, powerful without explaining. For those who do not need to be understood to be confident."],
            "sillage": "Deep, substantial",
            "longevity": "10+ hours",
            "season": "Evening, winter, ceremony",
            "notes": { "top": "Dark Musk", "heart": "Ambrette, Myrrh", "base": "Resinous Accords, Deep Musk" },
            "fieldReport": { "concept": "Obsidian blade resting on carved stone. Pyramid shadow falling across ceremonial space. Stars beginning to show through purple twilight.", "hotspots": [{ "_key": "h1", "item": "obsidian blade", "meaning": "Sharper than steel, older than memory" }, { "_key": "h2", "item": "pyramid shadow", "meaning": "Alignment we cannot explain" }, { "_key": "h3", "item": "first stars", "meaning": "The same sky they watched" }] }
        },
        {
            "name": "CLARITY",
            "legacyName": "Himalayan Musk",
            "territory": "territory-terra",
            "order": 5,
            "evocationPoint": { "location": "Namche Bazaar, Nepal", "coordinates": "27.9881° N, 86.9250° E" },
            "evocation": ["Above 3,400 meters, the air thins and something changes. The mind quiets. Thoughts that seemed essential at sea level reveal themselves as noise.", "CLARITY captures that ascent: very fresh and very breezy—like the Himalayan mountains. Airy and uplifting but not overwhelming, wears close to you.", "CLARITY offers the same gift: a scent that strips away noise and leaves only what is essential, what is true, what survives the climb."],
            "onSkin": ["Fresh, breezy notes open with the immediacy of high altitude—clean, crisp, stripped of everything unnecessary. The scent stays airy and uplifting throughout.", "CLARITY offers what mountains offer: the elimination of noise, the revelation of essence. For those who need to think more clearly, act more decisively."],
            "sillage": "Light, present",
            "longevity": "6-8 hours",
            "season": "Clarity moments, decision-making, new beginnings",
            "notes": { "top": "Fresh, Breezy, Airy", "heart": "Uplifting Accord, Clean Notes", "base": "Close-wearing Musk" },
            "fieldReport": { "concept": "Prayer flags snapping in high wind. Snow peaks visible through clear, thin air. The simplicity of altitude.", "hotspots": [{ "_key": "h1", "item": "prayer flags", "meaning": "Words carried by wind" }, { "_key": "h2", "item": "snow peaks", "meaning": "The view from stripped-down" }, { "_key": "h3", "item": "clear air", "meaning": "Nothing hidden, nothing extra" }] }
        },
        {
            "name": "CAIRO",
            "legacyName": "Superior Egyptian Musk",
            "territory": "territory-terra",
            "order": 6,
            "evocationPoint": { "location": "Khan el-Khalili, Cairo", "coordinates": "29.9773° N, 31.1325° E" },
            "evocation": ["Khan el-Khalili has operated continuously for over 600 years—a covered bazaar in the heart of Islamic Cairo where gold and spice and attar have been traded since the Mamluks.", "CAIRO captures that layered history: very rustic, very ancient—a scent that communicates old world Egyptian aesthetic. Rustic musk with ancient accords, heady and substantial.", "Cairo has been conquered, burned, rebuilt, and conquered again. It endures. CAIRO carries that same resilience: a fragrance with foundation, depth that comes from surviving."],
            "onSkin": ["Rustic musk opens with immediate character—not polished, not refined, but real. Ancient accords build through the heart, heady and substantial.", "CAIRO endures. It has foundation, depth, the kind of presence that comes from surviving every test. For those who build things that last."],
            "sillage": "Present, substantial",
            "longevity": "10+ hours",
            "season": "Evening year-round, occasions that matter",
            "notes": { "top": "Rustic Musk", "heart": "Ancient Accords, Heady Notes", "base": "Old World Egyptian Accord" },
            "fieldReport": { "concept": "Covered bazaar alley, light filtering through fabric awnings. Brass lanterns, unlit. Attar bottles catching what sun sneaks through.", "hotspots": [{ "_key": "h1", "item": "fabric-filtered light", "meaning": "600 years of afternoons" }, { "_key": "h2", "item": "brass lanterns", "meaning": "Waiting for dark" }, { "_key": "h3", "item": "attar bottles", "meaning": "Tradition unbroken" }] }
        },
        {
            "name": "ONYX",
            "legacyName": "Black Ambergris",
            "territory": "territory-terra",
            "order": 7,
            "evocationPoint": { "location": "Cape Agulhas, South Africa", "coordinates": "34.4208° S, 19.2414° E" },
            "evocation": ["Cape Agulhas is where two worlds collide. The true southern tip of Africa—where the warm Indian Ocean meets the cold Atlantic in a permanent churning of currents.", "ONYX captures that collision: a very dark, almost tar-like tobacco, grounded and earthy, sophisticated in its darkness. Dark tobacco meets tar accord, earthy notes and ambrette.", "The meeting of oceans creates something neither could make alone. ONYX works the same way: warm and cold existing in the same breath."],
            "onSkin": ["Dark tobacco opens with almost tar-like depth—grounded, earthy, unapologetic. Earthy notes build while ambrette adds seed-like warmth.", "ONYX does not offer comfort—it offers truth. The meeting of currents, the sense of standing where worlds end and begin."],
            "sillage": "Deep, complex",
            "longevity": "10+ hours",
            "season": "Evening, dramatic moments",
            "notes": { "top": "Dark Tobacco, Tar Accord", "heart": "Earthy Notes, Ambrette", "base": "Sophisticated Dark Accords" },
            "fieldReport": { "concept": "Lighthouse beam sweeping dark water. The line where two colors of ocean meet—warm current against cold. Storm light, silver and gold.", "hotspots": [{ "_key": "h1", "item": "lighthouse beam", "meaning": "Warning and welcome" }, { "_key": "h2", "item": "meeting currents", "meaning": "Neither ocean wins" }, { "_key": "h3", "item": "storm light", "meaning": "Beauty in collision" }] }
        }
    ]
};

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

function splitNotes(notesStr) {
    if (!notesStr) return [];
    return notesStr.split(',').map(s => s.trim()).filter(Boolean);
}

// Map territory reference IDs (e.g., 'territory-ember') to atmosphere values (e.g., 'ember')
// NOTE: I am also storing the territory reference object as requested in the schema update.
const territoryMap = {
    'territory-tidal': 'tidal',
    'territory-ember': 'ember',
    'territory-petal': 'petal',
    'territory-terra': 'terra',
};

async function ingest() {
    console.log('Starting ingestion...');

    // 1. Ingest Territories
    for (const t of data.territories) {
        console.log(`Processing territory: ${t.name}`);
        await client.createOrReplace({
            _id: t._id,
            _type: 'territory',
            name: t.name,
            slug: t.slug,
            tagline: t.tagline,
            description: t.description,
            keywords: t.keywords,
            order: t.order,
        });
    }
    console.log('Territories ingested.');

    // 2. Ingest Fragrances
    for (const f of data.fragrances) {
        console.log(`Processing fragrance: ${f.name}`);
        const slug = slugify(f.name);
        const productId = `product-${slug}`;

        const doc = {
            _id: productId,
            _type: 'product',
            title: f.name,
            legacyName: f.legacyName,
            slug: { _type: 'slug', current: slug },
            collectionType: 'atlas', // Defaulting to Atlas as they have evocation/territory

            // Root fields
            sillage: f.sillage,
            longevity: f.longevity,
            season: f.season,

            // Fragrance Notes
            notes: {
                top: splitNotes(f.notes.top),
                heart: splitNotes(f.notes.heart),
                base: splitNotes(f.notes.base),
            },

            // Atlas Data
            atlasData: {
                atmosphere: territoryMap[f.territory] || 'ember', // Default or map
                territory: { _type: 'reference', _ref: f.territory },
                gpsCoordinates: f.evocationPoint.coordinates, // Map exact coord string
                evocationLocation: f.evocationPoint.location,
                evocationStory: f.evocation, // Array of strings
                onSkinStory: f.onSkin, // Array of strings

                // Field Report Concept
                fieldReportConcept: {
                    concept: f.fieldReport.concept,
                    hotspots: f.fieldReport.hotspots.map(h => ({
                        _key: h._key,
                        item: h.item,
                        meaning: h.meaning
                    }))
                }
            }
        };

        // Use createOrReplace to ensure we update if exists
        // CAUTION: This overwrites existing fields not specified here? 
        // createOrReplace replaces the document.
        // If we want to PATCH, we should use patch().
        // Ideally, we start fresh or ensure we include all needed fields.
        // Given "Redesign" and "Ingest", replacing seems safer to ensure specific state.
        // However, we might lose 'mainImage' if it exists.
        // Strategy: Check if exists. If so, patch. If not, create.

        const existing = await client.fetch(`*[_id == $id][0]`, { id: productId });

        if (existing) {
            console.log(`Updating existing product: ${f.name}`);
            await client.patch(productId)
                .set({
                    title: f.name,
                    legacyName: f.legacyName,
                    collectionType: 'atlas',
                    sillage: f.sillage,
                    longevity: f.longevity,
                    season: f.season,
                    notes: doc.notes,
                    atlasData: {
                        ...existing.atlasData, // Preserve existing data like images if any
                        atmosphere: territoryMap[f.territory] || 'ember',
                        territory: { _type: 'reference', _ref: f.territory },
                        gpsCoordinates: f.evocationPoint.coordinates,
                        evocationLocation: f.evocationPoint.location,
                        evocationStory: f.evocation,
                        onSkinStory: f.onSkin,
                        fieldReportConcept: doc.atlasData.fieldReportConcept
                    }
                })
                .commit();
        } else {
            console.log(`Creating new product: ${f.name}`);
            await client.create(doc);
        }
    }

    console.log('Ingestion complete.');
}

ingest().catch(err => {
    console.error('Ingestion failed:', err);
    process.exit(1);
});
