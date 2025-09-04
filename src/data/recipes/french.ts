import { Recipe } from '@/types';

export const frenchRecipes: Recipe[] = [
  {
    recipeTitle: "Coq au Vin (Klassisch mit Rotwein)",
    shortDescription: "Ein rustikaler französischer Schmor-Klassiker. Zarte Hähnchenteile, langsam in einem kräftigen Rotwein-Sud mit Speck, Champignons und Zwiebeln gegart, bis das Fleisch vom Knochen fällt.",
    prepTime: "30 Min.",
    cookTime: "90 Min.",
    totalTime: "2 Std.",
    servings: "4 Personen",
    difficulty: "Mittel",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
          { quantity: "1", unit: "Stk.", name: "großes Hähnchen (ca. 1,5 kg), in 8 Teile zerlegt" },
          { quantity: "150", unit: "g", name: "durchwachsener Speck am Stück" },
          { quantity: "200", unit: "g", name: "kleine Champignons" },
          { quantity: "12", unit: "Stk.", name: "Perlzwiebeln" },
          { quantity: "2", unit: "Stk.", name: "Karotten" },
          { quantity: "2", unit: "Stk.", name: "Knoblauchzehen" },
          { quantity: "2", unit: "EL", name: "Mehl" },
          { quantity: "750", unit: "ml", name: "kräftiger, trockener Rotwein (z.B. Burgunder)" },
          { quantity: "250", unit: "ml", name: "Hühnerbrühe" },
          { quantity: "1", unit: "EL", name: "Tomatenmark" },
          { quantity: "1", unit: "Bund", name: "Thymian" },
          { quantity: "2", unit: "Stk.", name: "Lorbeerblätter" },
          { quantity: "", unit: "", name: "Salz, Pfeffer" },
          { quantity: "2", unit: "EL", name: "Butter" }
        ]
      }
    ],
    instructions: [
        "Den Speck würfeln und in einem großen Schmortopf auslassen. Herausnehmen und beiseitelegen. Im Speckfett die Hähnchenteile von allen Seiten goldbraun anbraten. Herausnehmen und salzen/pfeffern.",
        "Die Perlzwiebeln und die geputzten Champignons im selben Topf anbraten, bis sie Farbe annehmen. Herausnehmen.",
        "Die Karotten würfeln und den Knoblauch hacken. Beides in den Topf geben und kurz anrösten. Tomatenmark zugeben und kurz mitrösten.",
        "Das Mehl über das Gemüse stäuben und unter Rühren anschwitzen. Nach und nach mit dem Rotwein und der Brühe ablöschen, dabei gut rühren, um Klümpchen zu vermeiden.",
        "Thymian und Lorbeerblätter hinzufügen. Die Hähnchenteile zurück in den Topf geben. Aufkochen und dann zugedeckt bei schwacher Hitze 90 Minuten schmoren.",
        "Nach der Garzeit die Hähnchenteile aus der Soße nehmen und warm stellen. Die Soße durch ein Sieb passieren und bei Bedarf etwas einkochen lassen.",
        "Die kalte Butter in kleinen Stücken in die heiße (nicht kochende) Soße einrühren, um sie zu binden ('montieren'). Mit Salz und Pfeffer abschmecken.",
        "Hähnchen, Speck, Zwiebeln und Pilze in der Soße servieren. Dazu passen Baguette oder Kartoffelpüree."
    ],
    nutritionPerServing: { calories: "650 kcal", protein: "50 g", fat: "40 g", carbs: "15 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Französisch"],
      occasion: ["Wochenende", "Für Gäste"],
      mainIngredient: ["Huhn"],
      prepMethod: ["Ofengericht"],
      diet: []
    },
    expertTips: [
        { title: "Marinieren für mehr Geschmack", content: "Für ein noch intensiveres Aroma das Hähnchen über Nacht im Rotwein mit dem Gemüse und den Kräutern marinieren. Das Fleisch vor dem Anbraten gut abtrocknen." }
    ]
  },
  {
    recipeTitle: "Klassisches Ratatouille",
    shortDescription: "Ein rustikaler Gemüseeintopf aus der Provence, der den Sommer auf den Teller bringt. Auberginen, Zucchini, Paprika und Tomaten werden langsam in Olivenöl mit Kräutern geschmort. Perfekt als Beilage oder vegetarisches Hauptgericht.",
    prepTime: "20 Min.",
    cookTime: "40 Min.",
    totalTime: "1 Std.",
    servings: "4 Personen",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "1", unit: "Stk.", name: "Aubergine" },
            { quantity: "2", unit: "Stk.", name: "Zucchini" },
            { quantity: "2", unit: "Stk.", name: "rote Paprika" },
            { quantity: "2", unit: "Stk.", name: "Zwiebeln" },
            { quantity: "2", unit: "Stk.", name: "Knoblauchzehen" },
            { quantity: "400", unit: "g", name: "reife Tomaten" },
            { quantity: "4", unit: "EL", name: "Olivenöl" },
            { quantity: "1", unit: "TL", name: "getrocknete Kräuter der Provence" },
            { quantity: "", unit: "", name: "Salz, Pfeffer" }
        ]
      }
    ],
    instructions: [
      "Das gesamte Gemüse waschen. Aubergine, Zucchini, Paprika und Zwiebeln in etwa gleich große Würfel schneiden (ca. 2 cm). Knoblauch fein hacken. Tomaten häuten, entkernen und würfeln.",
      "Olivenöl in einem großen Topf oder Schmortopf erhitzen. Zuerst die Auberginenwürfel darin anbraten, bis sie leicht gebräunt sind. Aus dem Topf nehmen und beiseitelegen.",
      "Im selben Topf die Zwiebeln und Paprika anbraten, bis die Zwiebeln glasig sind. Dann die Zucchini hinzufügen und weitere 5 Minuten mitbraten.",
      "Knoblauch und Kräuter der Provence zugeben und kurz mitdünsten.",
      "Die gewürfelten Tomaten und die angebratenen Auberginen zurück in den Topf geben. Alles gut vermischen.",
      "Das Ratatouille mit Salz und Pfeffer würzen, zudecken und bei schwacher Hitze ca. 20-25 Minuten schmoren lassen, bis das Gemüse weich, aber noch bissfest ist.",
      "Vor dem Servieren nochmals abschmecken. Passt hervorragend zu gegrilltem Fisch, Fleisch oder einfach mit frischem Baguette."
    ],
    nutritionPerServing: { calories: "180 kcal", protein: "4 g", fat: "12 g", carbs: "15 g" },
    tags: {
      course: ["Beilage", "Hauptgericht"],
      cuisine: ["Französisch"],
      occasion: ["Sommer"],
      mainIngredient: ["Gemüse"],
      prepMethod: ["Pfannengericht"],
      diet: ["Vegan", "Vegetarisch", "Glutenfrei"]
    },
    expertTips: [
      {
        title: "Gemüse separat anbraten",
        content: "Der Schlüssel zu einem guten Ratatouille ist, das Gemüse (insbesondere die Auberginen) separat anzubraten. Dadurch behält jedes Gemüse seinen Eigengeschmack und seine Textur und der Eintopf wird nicht matschig."
      }
    ]
  },
  {
    recipeTitle: "Soupe à l'Oignon (Französische Zwiebelsuppe)",
    shortDescription: "Der Inbegriff französischer Bistro-Küche. Eine tiefbraune, süßlich-herzhafte Suppe aus langsam karamellisierten Zwiebeln, klassisch serviert mit einer Käsekruste aus Gruyère und Baguette.",
    prepTime: "15 Min.",
    cookTime: "60 Min.",
    totalTime: "1 Std. 15 Min.",
    servings: "4 Personen",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "500", unit: "g", name: "Zwiebeln" },
            { quantity: "50", unit: "g", name: "Butter" },
            { quantity: "1", unit: "EL", name: "Mehl" },
            { quantity: "200", unit: "ml", name: "trockener Weißwein" },
            { quantity: "1", unit: "l", name: "kräftige Rinderbrühe" },
            { quantity: "4", unit: "Scheiben", name: "Baguette" },
            { quantity: "100", unit: "g", name: "Gruyère-Käse, gerieben" }
        ]
      }
    ],
    instructions: [
        "Die Zwiebeln schälen, halbieren und in feine Streifen schneiden.",
        "Die Butter in einem großen, schweren Topf bei mittlerer Hitze schmelzen. Die Zwiebelstreifen hinzufügen und unter gelegentlichem Rühren langsam karamellisieren lassen. Das dauert ca. 25-30 Minuten. Sie sollten tiefgoldbraun und süß sein.",
        "Das Mehl über die Zwiebeln stäuben und eine Minute unter Rühren anschwitzen.",
        "Mit dem Weißwein ablöschen und den Bratensatz vom Topfboden kratzen. Fast vollständig einkochen lassen.",
        "Die Rinderbrühe angießen, aufkochen und die Suppe dann bei schwacher Hitze zugedeckt ca. 20 Minuten köcheln lassen. Mit Salz und Pfeffer abschmecken.",
        "Den Backofengrill vorheizen. Die Baguettescheiben in einer trockenen Pfanne von beiden Seiten anrösten.",
        "Die heiße Suppe in ofenfeste Schalen füllen. Auf jede Schale eine geröstete Baguettescheibe legen und großzügig mit dem geriebenen Gruyère bestreuen.",
        "Die Schalen unter den heißen Grill stellen und überbacken, bis der Käse geschmolzen und goldbraun ist. Sofort heiß servieren."
    ],
    nutritionPerServing: { calories: "450 kcal", protein: "18 g", fat: "25 g", carbs: "35 g" },
    tags: {
      course: ["Vorspeise", "Hauptgericht"],
      cuisine: ["Französisch"],
      occasion: ["Alltagsküche", "Herbst", "Winter"],
      mainIngredient: ["Gemüse"],
      prepMethod: ["Ofengericht"],
      diet: []
    },
    expertTips: [
        {
            title: "Geduld beim Zwiebelschmoren",
            content: "Nehmen Sie sich Zeit für das Karamellisieren der Zwiebeln. Niedrige bis mittlere Hitze ist entscheidend. Dieser Schritt entwickelt die tiefe, süße Geschmacksbasis der Suppe. Ungeduld führt zu bitteren, verbrannten Zwiebeln."
        }
    ]
  },
  {
    recipeTitle: "Crème Brûlée (Klassisch)",
    shortDescription: "Das ikonische französische Dessert. Eine zarte, cremige Vanille-Eier-Creme unter einer knackigen, goldbraunen Karamellkruste. Ein eleganter Klassiker, der einfacher zuzubereiten ist, als man denkt.",
    prepTime: "20 Min.",
    cookTime: "45 Min.",
    totalTime: "1 Std. 5 Min.",
    servings: "4 Personen",
    difficulty: "Mittel",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "500", unit: "ml", name: "Schlagsahne" },
            { quantity: "1", unit: "Stk.", name: "Vanilleschote" },
            { quantity: "6", unit: "Stk.", name: "Eigelb" },
            { quantity: "50", unit: "g", name: "Zucker" },
            { quantity: "4", unit: "EL", name: "brauner Zucker (zum Karamellisieren)" }
        ]
      }
    ],
    instructions: [
        "Den Backofen auf 150°C Ober-/Unterhitze vorheizen. Vier flache, ofenfeste Förmchen (ca. 150 ml) bereitstellen.",
        "Die Vanilleschote längs aufschlitzen und das Mark herauskratzen.",
        "Sahne, Vanillemark und die ausgekratzte Schote in einem Topf langsam erhitzen, bis sie kurz vor dem Kochen ist. Nicht kochen lassen! Vom Herd nehmen und 10 Minuten ziehen lassen.",
        "In einer Schüssel Eigelb und Zucker mit einem Schneebesen verrühren, aber nicht schaumig schlagen.",
        "Die Vanilleschote aus der Sahne entfernen. Die heiße Sahne langsam und unter ständigem Rühren zur Eigelb-Zucker-Mischung gießen.",
        "Den entstandenen Schaum von der Oberfläche der Creme abschöpfen.",
        "Die Creme durch ein feines Sieb in die Förmchen gießen.",
        "Die Förmchen in eine tiefe Auflaufform oder ein Backblech stellen. So viel heißes Wasser in die Form gießen, dass die Förmchen zu zwei Dritteln im Wasser stehen (Wasserbad).",
        "Im Ofen ca. 40-45 Minuten stocken lassen. Die Creme sollte in der Mitte noch leicht wackeln, wenn man am Förmchen rüttelt.",
        "Die Förmchen aus dem Wasserbad nehmen und vollständig abkühlen lassen. Dann für mindestens 4 Stunden im Kühlschrank durchkühlen.",
        "Kurz vor dem Servieren jede Crème Brûlée gleichmäßig mit einem Teelöffel braunem Zucker bestreuen. Mit einem Küchenbrenner den Zucker karamellisieren, bis eine goldbraune, harte Kruste entsteht."
    ],
    nutritionPerServing: { calories: "390 kcal", protein: "6 g", fat: "30 g", carbs: "25 g" },
    tags: {
      course: ["Dessert"],
      cuisine: ["Französisch"],
      occasion: ["Für Gäste", "Feiertage"],
      mainIngredient: ["Ei"],
      prepMethod: ["Ofengericht"],
      diet: ["Vegetarisch", "Glutenfrei"]
    },
    expertTips: [
        {
            title: "Ohne Küchenbrenner",
            content: "Wenn Sie keinen Küchenbrenner haben, können Sie die gezuckerten Crèmes unter dem sehr heißen Backofengrill kurz karamellisieren. Beobachten Sie sie dabei ständig, da der Zucker sehr schnell verbrennt."
        }
    ]
  },
  {
    recipeTitle: "Boeuf Bourguignon (Klassisch nach Julia Child)",
    shortDescription: "Der Inbegriff des französischen Schmorgerichts. Zarte Rindfleischwürfel, langsam in einem vollmundigen Burgunder-Rotwein mit Speck, Perlzwiebeln und Champignons geschmort, bis sie auf der Zunge zergehen. Ein zeitloser Klassiker, perfekt für ein festliches Essen.",
    prepTime: "45 Min.",
    cookTime: "3 Std. 30 Min.",
    totalTime: "4 Std. 15 Min.",
    servings: "6 Personen",
    difficulty: "Mittel",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "1.5", unit: "kg", name: "Rindfleisch (Schulter oder Keule), in 5cm Würfeln" },
            { quantity: "150", unit: "g", name: "Speck, am Stück" },
            { quantity: "1", unit: "Flasche", name: "Burgunder Rotwein" },
            { quantity: "500", unit: "ml", name: "Rinderbrühe" },
            { quantity: "2", unit: "Stk.", name: "Karotten" },
            { quantity: "1", unit: "Stk.", name: "große Zwiebel" },
            { quantity: "300", unit: "g", name: "Champignons" },
            { quantity: "200", unit: "g", name: "Perlzwiebeln" },
            { quantity: "", unit: "", name: "Salz, Pfeffer" }
        ]
      }
    ],
    instructions: [
        "Den Backofen auf 160°C vorheizen. Den Speck würfeln und in einem großen Schmortopf auslassen. Herausnehmen und beiseitelegen.",
        "Das Rindfleisch gut trocken tupfen und portionsweise im Speckfett von allen Seiten scharf anbraten. Aus dem Topf nehmen.",
        "Karotten und Zwiebel grob würfeln und im selben Topf anrösten.",
        "Das Fleisch zurück in den Topf geben. Mit Salz und Pfeffer würzen und mit Mehl bestäuben. Alles gut vermengen und für 5 Minuten im Ofen ohne Deckel anbräunen.",
        "Den Topf aus dem Ofen nehmen. Wein und Brühe angießen, sodass das Fleisch gerade bedeckt ist. Tomatenmark, Knoblauch und Kräuter hinzufügen.",
        "Den Schmortopf zudecken und für 3 Stunden im Ofen schmoren lassen, bis das Fleisch butterzart ist.",
        "In der Zwischenzeit die Perlzwiebeln in Butter anbraten und mit etwas Brühe weich dünsten. Die Champignons vierteln und ebenfalls in Butter anbraten.",
        "Den Topf aus dem Ofen nehmen. Fleisch und Gemüse mit einer Schaumkelle aus der Sauce heben. Die Sauce bei Bedarf entfetten und einkochen lassen, bis sie die gewünschte Konsistenz hat. Abschmecken.",
        "Fleisch, Speck, Perlzwiebeln und Champignons zurück in die Sauce geben und alles zusammen erhitzen.",
        "Heiß mit Kartoffelpüree, Nudeln oder Baguette servieren."
    ],
    nutritionPerServing: { calories: "888 kcal", protein: "55.7 g", fat: "48 g", carbs: "28 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Französisch"],
      occasion: ["Feiertage", "Wochenende"],
      mainIngredient: ["Rind"],
      prepMethod: ["Ofengericht"],
      diet: []
    },
    expertTips: [
        {
            title: "Die Wahl des Weins",
            content: "Verwenden Sie einen Wein, den Sie auch trinken würden. Ein guter Burgunder (Pinot Noir) oder ein anderer kräftiger Rotwein ist entscheidend für den Geschmack des Gerichts."
        }
    ]
  },
  {
    recipeTitle: "Quiche Lorraine (Originalrezept)",
    shortDescription: "Der weltberühmte herzhafte Kuchen aus der französischen Region Lothringen. Ein knuspriger Mürbeteigboden, gefüllt mit einer cremigen Masse aus Eiern, Sahne und geräuchertem Speck. Die klassische Variante wird oft mit Käse verfeinert.",
    prepTime: "25 Min. (+ 1 Std. Kühlzeit)",
    cookTime: "50 Min.",
    totalTime: "1 Std. 15 Min. (+ Kühlzeit)",
    servings: "1 Quiche (8 Stücke)",
    difficulty: "Mittel",
    ingredients: [
      {
        sectionTitle: "Für den Mürbeteig",
        items: [
            { quantity: "200", unit: "g", name: "Mehl" },
            { quantity: "100", unit: "g", name: "kalte Butter" },
            { quantity: "1", unit: "Stk.", name: "Eigelb" },
            { quantity: "1", unit: "Prise", name: "Salz" },
            { quantity: "2-3", unit: "EL", name: "kaltes Wasser" }
        ]
      },
      {
        sectionTitle: "Für die Füllung",
        items: [
            { quantity: "200", unit: "g", name: "geräucherter Speck, gewürfelt" },
            { quantity: "3", unit: "Stk.", name: "Eier" },
            { quantity: "200", unit: "ml", name: "Sahne (Crème fraîche double)" },
            { quantity: "200", unit: "ml", name: "Milch" },
            { quantity: "", unit: "", name: "Salz, Pfeffer, frisch geriebene Muskatnuss" },
            { quantity: "100", unit: "g", name: "Greyerzer Käse, gerieben (optional)" }
        ]
      }
    ],
    instructions: [
        "Für den Teig Mehl, Salz und kalte Butterwürfel zu einer krümeligen Masse verarbeiten. Eigelb und kaltes Wasser zugeben und rasch zu einem glatten Teig verkneten. In Folie wickeln und 1 Stunde kalt stellen.",
        "Den Backofen auf 200°C Ober-/Unterhitze vorheizen. Den Teig auf einer bemehlten Fläche ausrollen und eine Quicheform (28 cm) damit auslegen. Einen Rand formen.",
        "Den Teigboden mit einer Gabel mehrmals einstechen, mit Backpapier auslegen und mit Hülsenfrüchten beschweren. 15 Minuten blindbacken.",
        "In der Zwischenzeit den Speck in einer Pfanne knusprig auslassen und auf Küchenpapier abtropfen lassen.",
        "Hülsenfrüchte und Backpapier vom Teigboden entfernen und den Boden weitere 5 Minuten backen, bis er leicht gebräunt ist.",
        "Für die Füllung Eier, Sahne und Milch verquirlen. Kräftig mit Salz, Pfeffer und Muskatnuss würzen.",
        "Den knusprigen Speck und (optional) den geriebenen Käse auf dem vorgebackenen Boden verteilen.",
        "Die Eier-Sahne-Mischung darüber gießen.",
        "Die Quiche im Ofen bei auf 180°C reduzierter Hitze für ca. 30 Minuten backen, bis die Füllung gestockt ist und eine goldbraune Farbe hat.",
        "Vor dem Anschneiden kurz ruhen lassen. Schmeckt warm oder kalt."
    ],
    nutritionPerServing: { calories: "290 kcal", protein: "13 g", fat: "19 g", carbs: "17 g" },
    tags: {
      course: ["Hauptgericht", "Vorspeise"],
      cuisine: ["Französisch"],
      occasion: ["Brunch", "Party"],
      mainIngredient: ["Speck", "Ei"],
      prepMethod: ["Ofengericht"],
      diet: []
    },
    expertTips: [
        {
            title: "Blindbacken ist der Schlüssel",
            content: "Das Vorbacken des Teiges mit Hülsenfrüchten (Blindbacken) ist unerlässlich, um einen durchgeweichten Boden zu verhindern. So wird der Mürbeteig schön knusprig."
        }
    ]
  }
];