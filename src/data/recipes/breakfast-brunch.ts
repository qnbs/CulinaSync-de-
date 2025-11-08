import { Recipe } from '../../types';

export const breakfastBrunchRecipes: Recipe[] = [
  {
    recipeTitle: "Perfektes cremiges Rührei",
    shortDescription: "Das Geheimnis für Rührei, das nicht trocken und bröselig, sondern unglaublich cremig und saftig ist. Mit der richtigen Technik und niedriger Hitze gelingt ein Frühstücksklassiker in Restaurantqualität.",
    prepTime: "5 Min.",
    cookTime: "10 Min.",
    totalTime: "15 Min.",
    servings: "2 Personen",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "4", unit: "Stk.", name: "frische Eier" },
            { quantity: "2", unit: "EL", name: "Milch oder Sahne" },
            { quantity: "1", unit: "EL", name: "Butter" },
            { quantity: "", unit: "", name: "Salz, Pfeffer, Schnittlauch" }
        ]
      }
    ],
    instructions: [
        "Die Eier in eine Schüssel schlagen und mit Milch oder Sahne verquirlen. Erst kurz vor dem Braten salzen und pfeffern.",
        "Eine beschichtete Pfanne bei niedriger bis mittlerer Hitze erwärmen. Die Butter darin schmelzen.",
        "Die Eiermasse in die Pfanne gießen und eine Minute stocken lassen.",
        "Mit einem Gummispatel die gestockte Eimasse vom Rand zur Mitte schieben. Die Pfanne dabei kippen, damit das flüssige Ei nachläuft.",
        "Diesen Vorgang langsam wiederholen. Die Eier sollten langsam zu großen, weichen 'Curds' stocken.",
        "Die Pfanne vom Herd nehmen, wenn das Rührei noch leicht feucht und glänzend ist. Es gart durch die Restwärme nach.",
        "Mit frisch geschnittenem Schnittlauch bestreuen und sofort servieren."
    ],
    nutritionPerServing: { calories: "230 kcal", protein: "20 g", fat: "23 g", carbs: "3 g" },
    tags: {
      course: ["Frühstück", "Hauptgericht"],
      cuisine: ["International"],
      occasion: [],
      mainIngredient: ["Ei"],
      prepMethod: ["Pfannengericht"],
      diet: ["Vegetarisch"]
    },
    expertTips: [
        {
            title: "Niedrige Hitze ist der Schlüssel",
            content: "Der häufigste Fehler bei Rührei ist zu hohe Hitze. Dadurch stockt das Eiweiß zu schnell und wird trocken. Garen Sie es langsam und geduldig bei niedriger Hitze für ein cremiges Ergebnis."
        }
    ]
  },
  {
    recipeTitle: "Original Shakshuka",
    shortDescription: "Ein aromatisches Pfannengericht aus Nordafrika und dem Nahen Osten. Eier werden in einer würzigen Sauce aus Tomaten, Paprika und Zwiebeln pochiert. Ein perfektes, wärmendes Gericht für Brunch oder ein schnelles Abendessen.",
    prepTime: "10 Min.",
    cookTime: "20 Min.",
    totalTime: "30 Min.",
    servings: "2 Personen",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "1", unit: "Dose", name: "gehackte Tomaten (400g)" },
            { quantity: "1", unit: "Stk.", name: "Zwiebel" },
            { quantity: "1", unit: "Stk.", name: "rote Paprika" },
            { quantity: "2", unit: "Stk.", name: "Knoblauchzehen" },
            { quantity: "4", unit: "Stk.", name: "Eier" },
            { quantity: "1", unit: "TL", name: "Kreuzkümmel" },
            { quantity: "1", unit: "TL", name: "Paprikapulver" },
            { quantity: "", unit: "", name: "Feta und Koriander zum Servieren" }
        ]
      }
    ],
    instructions: [
        "Zwiebel und Paprika würfeln, Knoblauch hacken.",
        "Olivenöl in einer großen Pfanne erhitzen. Zwiebel und Paprika darin weich dünsten.",
        "Knoblauch, Kreuzkümmel und Paprikapulver hinzufügen und eine Minute mitbraten.",
        "Die gehackten Tomaten hinzufügen, mit Salz und Pfeffer würzen und die Sauce 10 Minuten köcheln lassen.",
        "Mit einem Löffel vier Vertiefungen in die Tomatensauce machen.",
        "In jede Vertiefung vorsichtig ein Ei aufschlagen.",
        "Die Pfanne abdecken und bei schwacher Hitze 5-8 Minuten garen, bis das Eiweiß gestockt, das Eigelb aber noch flüssig ist.",
        "Mit zerbröseltem Feta und frischem Koriander bestreuen. Direkt aus der Pfanne mit Fladenbrot servieren."
    ],
    nutritionPerServing: { calories: "382 kcal", protein: "16 g", fat: "31 g", carbs: "10 g" },
    tags: {
      course: ["Frühstück", "Hauptgericht"],
      cuisine: ["Nordafrikanisch", "Israelisch"],
      diet: ["Vegetarisch", "Glutenfrei"],
      occasion: ["Brunch"],
      mainIngredient: ["Ei", "Gemüse"],
      prepMethod: ["One-Pot", "Pfannengericht"]
    },
    expertTips: []
  },
  {
    recipeTitle: "Avocado Toast mit pochiertem Ei",
    shortDescription: "Ein moderner Frühstücksklassiker, der gesund, sättigend und schnell zubereitet ist. Cremig zerdrückte Avocado auf knusprigem Vollkorntoast, gekrönt von einem perfekt pochierten Ei mit flüssigem Kern.",
    prepTime: "10 Min.",
    cookTime: "5 Min.",
    totalTime: "15 Min.",
    servings: "2 Personen",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "2", unit: "Scheiben", name: "Vollkorntoast" },
            { quantity: "1", unit: "Stk.", name: "reife Avocado" },
            { quantity: "2", unit: "Stk.", name: "sehr frische Eier" },
            { quantity: "1", unit: "Schuss", name: "Zitronensaft" },
            { quantity: "", unit: "", name: "Chiliflocken, Salz, Pfeffer" }
        ]
      }
    ],
    instructions: [
        "Wasser in einem Topf zum Sieden bringen (nicht kochend!) und einen Schuss Essig hinzufügen.",
        "Ein Ei in eine kleine Tasse aufschlagen. Im siedenden Wasser mit einem Löffel einen Strudel erzeugen und das Ei vorsichtig in die Mitte gleiten lassen. Ca. 3-4 Minuten pochieren, bis das Eiweiß fest ist, das Eigelb aber flüssig.",
        "Das pochierte Ei mit einer Schaumkelle aus dem Wasser heben und auf Küchenpapier abtropfen lassen. Mit dem zweiten Ei wiederholen.",
        "Währenddessen die Brotscheiben toasten.",
        "Das Fruchtfleisch der Avocado mit einer Gabel zerdrücken, mit Zitronensaft, Salz und Pfeffer abschmecken.",
        "Die Avocadocreme auf den warmen Toastscheiben verteilen.",
        "Auf jeden Toast ein pochiertes Ei setzen, mit Chiliflocken, Salz und Pfeffer bestreuen und sofort servieren."
    ],
    nutritionPerServing: { calories: "321 kcal", protein: "12 g", fat: "23 g", carbs: "21 g" },
    tags: {
      course: ["Frühstück"],
      cuisine: ["International"],
      occasion: [],
      mainIngredient: ["Ei", "Gemüse"],
      prepMethod: ["Pfannengericht"],
      diet: ["Vegetarisch"]
    },
    expertTips: [
        {
            title: "Perfekt pochierte Eier",
            content: "Der Schlüssel zu perfekt pochierten Eiern sind sehr frische Eier und ein Schuss Essig im Wasser. Der Essig hilft dem Eiweiß, schneller zu stocken und zusammenzuhalten."
        }
    ]
  },
  {
    recipeTitle: "Original Schweizer Bircher Müsli",
    shortDescription: "Der gesunde Frühstücksklassiker, erfunden vom Schweizer Arzt Dr. Bircher-Benner. Zarte Haferflocken werden über Nacht eingeweicht und mit frisch geriebenem Apfel, Nüssen und Zitrone zu einem nahrhaften und bekömmlichen Müsli kombiniert.",
    prepTime: "10 Min.",
    cookTime: "0 Min.",
    totalTime: "10 Min. (+ mind. 4 Std. Einweichzeit)",
    servings: "2 Personen",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "80", unit: "g", name: "zarte Haferflocken" },
            { quantity: "150", unit: "ml", name: "Milch" },
            { quantity: "150", unit: "g", name: "Joghurt" },
            { quantity: "1", unit: "Stk.", name: "großer Apfel" },
            { quantity: "1", unit: "EL", name: "Zitronensaft" },
            { quantity: "2", unit: "EL", name: "gehackte Haselnüsse oder Mandeln" },
            { quantity: "1", unit: "EL", name: "Honig oder Ahornsirup" }
        ]
      }
    ],
    instructions: [
        "Die Haferflocken mit der Milch in einer Schüssel vermischen und abgedeckt für mindestens 4 Stunden oder über Nacht im Kühlschrank einweichen lassen.",
        "Kurz vor dem Servieren den Apfel grob reiben (mit Schale) und sofort mit dem Zitronensaft vermischen, um das Braunwerden zu verhindern.",
        "Den geriebenen Apfel, Joghurt, Nüsse und Honig zu den eingeweichten Haferflocken geben.",
        "Alles gut vermischen, bis eine cremige Konsistenz entsteht.",
        "Auf zwei Schalen verteilen und nach Belieben mit frischen Beeren oder anderen Früchten garnieren."
    ],
    nutritionPerServing: { calories: "342 kcal", protein: "7 g", fat: "13 g", carbs: "45 g" },
    tags: {
      course: ["Frühstück"],
      cuisine: ["Schweizerisch"],
      diet: ["Vegetarisch"],
      occasion: [],
      mainIngredient: ["Haferflocken", "Apfel"],
      prepMethod: ["Ohne Kochen"]
    },
    expertTips: []
  },
  {
    recipeTitle: "Dickflüssige Beeren-Smoothie-Bowl",
    shortDescription: "Ein gesundes, farbenfrohes und sättigendes Frühstück zum Löffeln. Gefrorene Beeren und Banane werden zu einer dicken, eiscreme-ähnlichen Masse püriert und mit frischen Früchten, Nüssen und Samen kreativ garniert.",
    prepTime: "10 Min.",
    cookTime: "0 Min.",
    totalTime: "10 Min.",
    servings: "1 Person",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Für die Basis",
        items: [
            { quantity: "150", unit: "g", name: "gefrorene Beerenmischung" },
            { quantity: "1", unit: "Stk.", name: "gefrorene Banane" },
            { quantity: "50-100", unit: "ml", name: "Pflanzenmilch oder Joghurt" }
        ]
      },
      {
        sectionTitle: "Für das Topping (Beispiele)",
        items: [
            { quantity: "", unit: "", name: "Frische Früchte (Beeren, Bananenscheiben)" },
            { quantity: "", unit: "", name: "Nüsse und Samen (Chia, Leinsamen, Mandeln)" },
            { quantity: "", unit: "", name: "Granola oder Müsli" }
        ]
      }
    ],
    instructions: [
        "Die gefrorenen Beeren, die gefrorene Banane und eine kleine Menge Flüssigkeit in einen leistungsstarken Mixer geben.",
        "Auf niedriger Stufe beginnen zu mixen, dabei die Zutaten mit dem Stößel nach unten drücken. Die Geschwindigkeit langsam erhöhen.",
        "Nur so viel Flüssigkeit wie absolut nötig hinzufügen, um eine sehr dicke, eiscremeähnliche Konsistenz zu erhalten.",
        "Die Smoothie-Masse in eine Schüssel füllen.",
        "Kreativ mit den ausgewählten Toppings garnieren und sofort genießen."
    ],
    nutritionPerServing: { calories: "393 kcal", protein: "17 g", fat: "21 g", carbs: "30 g" },
    tags: {
      course: ["Frühstück"],
      cuisine: ["International"],
      diet: ["Vegetarisch", "Glutenfrei", "Vegan"],
      occasion: [],
      mainIngredient: ["Früchte"],
      prepMethod: ["Ohne Kochen"]
    },
    expertTips: [
        {
            title: "Die richtige Konsistenz",
            content: "Der Schlüssel zu einer dicken Smoothie Bowl ist die Verwendung von gefrorenen Früchten und so wenig Flüssigkeit wie möglich. Ein leistungsstarker Mixer mit Stößel ist hier sehr hilfreich."
        }
    ]
  }
];