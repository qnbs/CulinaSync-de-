import { Recipe } from '@/types';

export const asianRecipes: Recipe[] = [
  {
    recipeTitle: "Pad Thai (mit Garnelen)",
    shortDescription: "Das Nationalgericht Thailands. Gebratene Reisnudeln in einer süß-sauren Tamarindensoße, serviert mit Garnelen, Tofu, frischen Sojasprossen, Erdnüssen und einem Spritzer Limette.",
    prepTime: "20 Min.",
    cookTime: "15 Min.",
    totalTime: "35 Min.",
    servings: "2 Personen",
    difficulty: "Mittel",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "200", unit: "g", name: "Reisbandnudeln (ca. 5mm breit)" },
            { quantity: "200", unit: "g", name: "Garnelen, geschält und entdarmt" },
            { quantity: "100", unit: "g", name: "fester Tofu, gewürfelt" },
            { quantity: "2", unit: "Stk.", name: "Eier" },
            { quantity: "100", unit: "g", name: "Sojasprossen" },
            { quantity: "2", unit: "Stk.", name: "Frühlingszwiebeln, geschnitten" }
        ]
      },
      {
        sectionTitle: "Für die Soße",
        items: [
            { quantity: "3", unit: "EL", name: "Tamarindenpaste" },
            { quantity: "3", unit: "EL", name: "Fischsauce" },
            { quantity: "3", unit: "EL", name: "Palmzucker (oder brauner Zucker)" }
        ]
      },
      {
        sectionTitle: "Zum Servieren",
        items: [
          { quantity: "50", unit: "g", name: "geröstete Erdnüsse, gehackt" },
          { quantity: "", unit: "", name: "frische Korianderblätter" },
          { quantity: "", unit: "", name: "Limettenspalten" },
          { quantity: "", unit: "", name: "Chiliflocken" }
        ]
      }
    ],
    instructions: [
        "Die Reisnudeln nach Packungsanweisung einweichen, bis sie biegsam, aber noch fest sind. Gut abtropfen lassen.",
        "Für die Soße Tamarindenpaste, Fischsauce und Zucker in einer kleinen Schüssel verrühren, bis sich der Zucker aufgelöst hat.",
        "Einen Wok oder eine große Pfanne stark erhitzen. Etwas Öl hineingeben und den Tofu goldbraun anbraten. Aus dem Wok nehmen.",
        "Die Garnelen im Wok braten, bis sie rosa sind. Ebenfalls herausnehmen.",
        "Die Eier in den Wok schlagen und zu Rührei verrühren. An den Rand schieben.",
        "Die abgetropften Nudeln in den Wok geben und unter Rühren 1-2 Minuten braten.",
        "Die Pad-Thai-Soße über die Nudeln gießen und alles gut vermischen, bis die Nudeln die Soße aufgesogen haben.",
        "Tofu, Garnelen, die Hälfte der Sojasprossen und die Frühlingszwiebeln hinzufügen. Alles schnell durchschwenken.",
        "Auf Tellern anrichten und mit den restlichen Sojasprossen, gehackten Erdnüssen, Koriander, Limettenspalten und Chiliflocken servieren."
    ],
    nutritionPerServing: { calories: "750 kcal", protein: "30 g", fat: "35 g", carbs: "80 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Thailändisch"],
      occasion: ["Alltagsküche", "Schnelle Küche"],
      mainIngredient: ["Garnelen", "Pasta"],
      prepMethod: ["Pfannengericht"],
      diet: []
    },
    expertTips: [
        {
            title: "Vorbereitung ist alles",
            content: "Die Wok-Küche ist sehr schnell. Stellen Sie sicher, dass alle Zutaten (Soße, Gemüse, Proteine) vorbereitet und griffbereit sind, bevor Sie den Wok erhitzen. Der eigentliche Kochvorgang dauert nur wenige Minuten."
        }
    ]
  },
  {
    recipeTitle: "Grünes Thai Curry (mit Huhn)",
    shortDescription: "Ein aromatisches und scharfes Curry aus Thailand. Zarte Hähnchenbruststreifen und knackiges Gemüse in einer cremigen Soße aus grüner Currypaste und Kokosmilch, verfeinert mit Kaffir-Limettenblättern und Thai-Basilikum.",
    prepTime: "15 Min.",
    cookTime: "20 Min.",
    totalTime: "35 Min.",
    servings: "4 Personen",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "400", unit: "g", name: "Hähnchenbrustfilet, in Streifen" },
            { quantity: "2-3", unit: "EL", name: "grüne Currypaste" },
            { quantity: "400", unit: "ml", name: "Kokosmilch" },
            { quantity: "1", unit: "Stk.", name: "rote Paprika, in Streifen" },
            { quantity: "100", unit: "g", name: "Zuckerschoten" },
            { quantity: "1", unit: "Handvoll", name: "Thai-Basilikum" },
            { quantity: "2", unit: "Stk.", name: "Kaffir-Limettenblätter" },
            { quantity: "1", unit: "EL", name: "Fischsauce" },
            { quantity: "1", unit: "TL", name: "Palmzucker" }
        ]
      }
    ],
    instructions: [
        "In einem Wok oder Topf bei mittlerer Hitze 2-3 EL von der dickflüssigen Kokoscreme (oberer Teil der Dose) erhitzen, bis das Öl austritt.",
        "Die grüne Currypaste hinzufügen und unter Rühren 1-2 Minuten anbraten, bis sie duftet.",
        "Die Hähnchenstreifen dazugeben und unter Rühren anbraten, bis sie nicht mehr roh sind.",
        "Die restliche Kokosmilch, Fischsauce und Palmzucker hinzufügen. Gut verrühren und aufkochen lassen.",
        "Die Kaffir-Limettenblätter (leicht einreißen, um das Aroma freizusetzen) und das Gemüse (Paprika, Zuckerschoten) hinzufügen.",
        "Das Curry ca. 5-7 Minuten köcheln lassen, bis das Gemüse gar, aber noch bissfest ist.",
        "Den Wok vom Herd nehmen und die Thai-Basilikumblätter unterrühren, bis sie zusammenfallen.",
        "Mit Jasminreis servieren."
    ],
    nutritionPerServing: { calories: "895 kcal", protein: "40 g", fat: "61 g", carbs: "61 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Thailändisch"],
      occasion: ["Alltagsküche"],
      mainIngredient: ["Huhn"],
      prepMethod: ["Pfannengericht"],
      diet: ["Glutenfrei"]
    },
    expertTips: [
        {
            title: "Vegetarische Variante",
            content: "Ersetzen Sie das Hähnchen durch festen Tofu oder eine Mischung aus Gemüse wie Brokkoli, Bambussprossen und Babymais. Verwenden Sie anstelle von Fischsauce helle Sojasauce."
        }
    ]
  },
  {
    recipeTitle: "Kung Pao Chicken (Szechuan-Stil)",
    shortDescription: "Ein berühmtes Gericht aus der Szechuan-Küche, bekannt für seine 'málà' (betäubend-scharfe) Geschmacksnote. Zarte, marinierte Hähnchenwürfel werden mit Erdnüssen, getrockneten Chilis und Szechuan-Pfefferkörnern in einer süß-sauren, würzigen Soße kurzgebraten.",
    prepTime: "20 Min.",
    cookTime: "10 Min.",
    totalTime: "30 Min.",
    servings: "2-3 Personen",
    difficulty: "Mittel",
    ingredients: [
      {
        sectionTitle: "Für die Marinade",
        items: [
            { quantity: "300", unit: "g", name: "Hähnchenbrust, gewürfelt" },
            { quantity: "1", unit: "EL", name: "Sojasauce" },
            { quantity: "1", unit: "TL", name: "Speisestärke" }
        ]
      },
      {
        sectionTitle: "Für die Soße",
        items: [
            { quantity: "3", unit: "EL", name: "Sojasauce" },
            { quantity: "2", unit: "EL", name: "Reisessig" },
            { quantity: "1", unit: "EL", name: "Zucker" },
            { quantity: "1", unit: "TL", name: "Speisestärke" }
        ]
      },
      {
        sectionTitle: "Zum Anbraten",
        items: [
            { quantity: "10", unit: "Stk.", name: "getrocknete rote Chilis" },
            { quantity: "1", unit: "TL", name: "Szechuan-Pfefferkörner" },
            { quantity: "100", unit: "g", name: "ungesalzene Erdnüsse" },
            { quantity: "2", unit: "Stk.", name: "Frühlingszwiebeln" }
        ]
      }
    ],
    instructions: [
        "Das Hähnchenfleisch mit Sojasauce und Speisestärke vermischen und 15 Minuten marinieren lassen.",
        "Alle Zutaten für die Soße in einer kleinen Schüssel glatt rühren.",
        "Einen Wok stark erhitzen. Etwas Öl hineingeben. Die Szechuan-Pfefferkörner und die getrockneten Chilis kurz anbraten, bis sie duften. Vorsicht, sie verbrennen schnell! Herausnehmen oder an den Rand schieben.",
        "Das marinierte Hähnchenfleisch in den Wok geben und unter Rühren anbraten, bis es gar ist.",
        "Die Soße in den Wok gießen und schnell aufkochen lassen, bis sie andickt und das Hähnchen überzieht.",
        "Die gerösteten Erdnüsse und die in Ringe geschnittenen Frühlingszwiebeln unterheben.",
        "Sofort mit gedämpftem Reis servieren."
    ],
    nutritionPerServing: { calories: "555 kcal", protein: "28 g", fat: "41 g", carbs: "18 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Chinesisch"],
      occasion: ["Alltagsküche"],
      mainIngredient: ["Huhn", "Nüsse"],
      prepMethod: ["Pfannengericht"],
      diet: []
    },
    expertTips: [
        {
            title: "Das 'Málà'-Gefühl",
            content: "Der Szechuan-Pfeffer sorgt für das charakteristische, leicht betäubende Prickeln auf der Zunge. Rösten Sie die Körner vor der Verwendung kurz in einer trockenen Pfanne an, um ihr Aroma zu intensivieren."
        }
    ]
  },
  {
    recipeTitle: "Butter Chicken (Murgh Makhani)",
    shortDescription: "Eines der berühmtesten indischen Gerichte weltweit. Zarte, marinierte Hähnchenstücke in einer unglaublich cremigen, mild-würzigen und leicht süßlichen Tomaten-Butter-Sauce. Ein luxuriöses Curry, das einfacher zuzubereiten ist, als es scheint.",
    prepTime: "20 Min.",
    cookTime: "30 Min.",
    totalTime: "50 Min.",
    servings: "4 Personen",
    difficulty: "Mittel",
    ingredients: [
      {
        sectionTitle: "Für die Marinade",
        items: [
            { quantity: "500", unit: "g", name: "Hähnchenbrust, gewürfelt" },
            { quantity: "150", unit: "g", name: "Joghurt" },
            { quantity: "1", unit: "EL", name: "Garam Masala" },
            { quantity: "1", unit: "TL", name: "Kurkuma" },
            { quantity: "1", unit: "TL", name: "Ingwer-Knoblauch-Paste" }
        ]
      },
      {
        sectionTitle: "Für die Sauce",
        items: [
            { quantity: "50", unit: "g", name: "Butter" },
            { quantity: "400", unit: "g", name: "passierte Tomaten" },
            { quantity: "100", unit: "ml", name: "Sahne" },
            { quantity: "50", unit: "g", name: "Cashewkerne, eingeweicht" },
            { quantity: "1", unit: "TL", name: "Zucker" }
        ]
      }
    ],
    instructions: [
        "Das Hähnchenfleisch mit allen Zutaten für die Marinade vermischen und mindestens 30 Minuten (besser länger) im Kühlschrank ziehen lassen.",
        "Die eingeweichten Cashewkerne mit etwas Wasser zu einer feinen Paste pürieren.",
        "Das marinierte Hähnchen in einer heißen Pfanne oder auf dem Grill garen, bis es durch ist und leichte Röstaromen hat.",
        "In einem Topf die Butter schmelzen. Die passierten Tomaten hinzufügen und 5 Minuten köcheln lassen.",
        "Die Cashew-Paste, Garam Masala, Zucker und Salz hinzufügen und weitere 5 Minuten köcheln lassen.",
        "Die Sahne unterrühren und die Soße erhitzen, aber nicht mehr kochen lassen.",
        "Das gegrillte Hähnchenfleisch in die Soße geben und alles zusammen durchwärmen.",
        "Mit frischem Koriander garnieren und mit Naan-Brot oder Basmatireis servieren."
    ],
    nutritionPerServing: { calories: "490 kcal", protein: "30 g", fat: "33 g", carbs: "14 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Indisch"],
      occasion: ["Für Gäste", "Wochenende"],
      mainIngredient: ["Huhn"],
      prepMethod: ["One-Pot"],
      diet: []
    },
    expertTips: [
        {
            title: "Rauchiges Aroma",
            content: "Für ein authentisches Tandoori-Aroma das marinierte Hähnchen auf Spießen grillen, bis es leicht angekohlt ist, bevor es in die Soße kommt. Alternativ kann man dem Gericht mit ein paar Tropfen Raucharoma nachhelfen."
        }
    ]
  },
  {
    recipeTitle: "Vegetarische Samosas mit Kartoffel-Erbsen-Füllung",
    shortDescription: "Der ikonische, knusprige Snack aus Indien. Handgemachte Teigtaschen mit einer würzigen Füllung aus Kartoffeln, Erbsen und aromatischen Gewürzen, goldbraun frittiert. Perfekt als Vorspeise, für Buffets oder als herzhafter Snack zwischendurch.",
    prepTime: "40 Min. (+ 30 Min. Ruhezeit für den Teig)",
    cookTime: "20 Min.",
    totalTime: "1 Std. (+ Ruhezeit)",
    servings: "ca. 10 Samosas",
    difficulty: "Mittel",
    ingredients: [
      {
        sectionTitle: "Für den Teig",
        items: [
            { quantity: "250", unit: "g", name: "Mehl" },
            { quantity: "4", unit: "EL", name: "Ghee oder Öl" },
            { quantity: "0.5", unit: "TL", name: "Salz" }
        ]
      },
      {
        sectionTitle: "Für die Füllung",
        items: [
            { quantity: "3", unit: "Stk.", name: "große Kartoffeln, gekocht" },
            { quantity: "100", unit: "g", name: "Erbsen, tiefgekühlt" },
            { quantity: "1", unit: "Stk.", name: "Zwiebel, gewürfelt" },
            { quantity: "1", unit: "TL", name: "Kreuzkümmelsamen" },
            { quantity: "1", unit: "TL", name: "gemahlener Koriander" },
            { quantity: "0.5", unit: "TL", name: "Garam Masala" }
        ]
      },
      {
        sectionTitle: "Außerdem",
        items: [
          { quantity: "ca. 1", unit: "l", name: "Pflanzenöl zum Frittieren" }
        ]
      }
    ],
    instructions: [
        "Für den Teig Mehl, Salz und Ghee vermischen, bis eine krümelige Masse entsteht. Nach und nach Wasser zugeben und zu einem festen, glatten Teig kneten. Abgedeckt 30 Minuten ruhen lassen.",
        "Für die Füllung die gekochten Kartoffeln grob zerdrücken. Öl in einer Pfanne erhitzen, Kreuzkümmelsamen anrösten. Zwiebeln zugeben und glasig dünsten.",
        "Die restlichen Gewürze hinzufügen und kurz mitbraten. Kartoffeln und Erbsen untermischen. Mit Salz abschmecken und die Füllung abkühlen lassen.",
        "Den Teig in 5 gleich große Kugeln teilen. Jede Kugel zu einem dünnen, ovalen Fladen ausrollen und halbieren.",
        "Jeden Halbkreis zu einer Tüte formen, indem man die gerade Kante mit etwas Wasser befeuchtet und übereinanderlegt. Die Tüte mit der Füllung füllen und die obere Kante gut verschließen.",
        "Das Öl in einem Topf oder einer Fritteuse auf ca. 160°C erhitzen.",
        "Die Samosas portionsweise goldbraun und knusprig frittieren (ca. 5-7 Minuten).",
        "Auf Küchenpapier abtropfen lassen und heiß mit Minz-Chutney oder Tamarinden-Chutney servieren."
    ],
    nutritionPerServing: { calories: "250 kcal", protein: "5 g", fat: "12 g", carbs: "30 g" },
    tags: {
      course: ["Vorspeise", "Snack"],
      cuisine: ["Indisch"],
      occasion: ["Party"],
      mainIngredient: ["Kartoffel"],
      prepMethod: ["Pfannengericht"],
      diet: ["Vegan", "Vegetarisch"]
    },
    expertTips: [
        {
            title: "Blasen im Teig vermeiden",
            content: "Für eine glatte, knusprige Oberfläche ohne Blasen die Samosas bei mittlerer Hitze langsam frittieren. Zu heißes Öl lässt den Teig zu schnell aufgehen und Blasen werfen."
        }
    ]
  },
  {
    recipeTitle: "Chana Masala (Kichererbsen-Curry)",
    shortDescription: "Ein herzhaftes und nahrhaftes Kichererbsen-Curry aus Nordindien. Dieses einfache One-Pot-Gericht ist voller Geschmack durch eine aromatische Zwiebel-Tomaten-Basis und eine wärmende Gewürzmischung. Perfekt als schnelles vegetarisches oder veganes Hauptgericht mit Reis oder Naan-Brot.",
    prepTime: "10 Min.",
    cookTime: "25 Min.",
    totalTime: "35 Min.",
    servings: "4 Personen",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "2", unit: "Dosen", name: "Kichererbsen (à 400g), abgetropft" },
            { quantity: "1", unit: "Dose", name: "gehackte Tomaten (400g)" },
            { quantity: "1", unit: "Stk.", name: "große Zwiebel" },
            { quantity: "2", unit: "Stk.", name: "Knoblauchzehen" },
            { quantity: "1", unit: "Stück", name: "Ingwer (daumengroß)" },
            { quantity: "1", unit: "TL", name: "Garam Masala" },
            { quantity: "1", unit: "TL", name: "Kreuzkümmel, gemahlen" },
            { quantity: "1", unit: "TL", name: "Kurkuma" },
            { quantity: "1", unit: "Bund", name: "frischer Koriander" }
        ]
      }
    ],
    instructions: [
        "Zwiebel, Knoblauch und Ingwer fein hacken oder zu einer Paste verarbeiten.",
        "Öl in einem Topf erhitzen. Kreuzkümmel kurz anrösten. Die Zwiebel-Ingwer-Knoblauch-Paste hinzufügen und goldbraun anbraten.",
        "Kurkuma und Garam Masala hinzufügen und eine Minute mitbraten, bis es duftet.",
        "Die gehackten Tomaten hinzufügen und alles zusammen ca. 5-7 Minuten köcheln lassen, bis das Öl sich an den Rändern absetzt.",
        "Die abgetropften Kichererbsen und eine Tasse Wasser hinzufügen. Mit Salz abschmecken.",
        "Das Curry aufkochen und dann bei schwacher Hitze 10-15 Minuten köcheln lassen, damit sich die Aromen verbinden. Einige Kichererbsen mit einem Löffel am Topfrand zerdrücken, um die Soße anzudicken.",
        "Den gehackten Koriander unterrühren und sofort mit Reis oder Naan-Brot servieren."
    ],
    nutritionPerServing: { calories: "250 kcal", protein: "16 g", fat: "18 g", carbs: "57 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Indisch"],
      occasion: ["Alltagsküche", "Schnelle Küche"],
      mainIngredient: ["Linse"],
      prepMethod: ["One-Pot"],
      diet: ["Vegan", "Vegetarisch", "Glutenfrei"]
    },
    expertTips: [
        {
            title: "Für extra Geschmack",
            content: "Fügen Sie am Ende einen Spritzer Zitronen- oder Limettensaft hinzu, um die Aromen aufzuhellen. Eine Prise getrockneter Bockshornkleeblätter (Kasuri Methi) verleiht dem Gericht ebenfalls ein authentisches, tiefes Aroma."
        }
    ]
  }
];