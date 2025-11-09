import { Recipe } from '../../types';

export const asianRecipes: Recipe[] = [
  {
    seedId: "th-01",
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
    seedId: "th-02",
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
  }
];