import { Recipe } from '@/types';

export const spanishPortugueseRecipes: Recipe[] = [
  {
    recipeTitle: "Paella Valenciana (Originalrezept)",
    shortDescription: "Das authentische Nationalgericht aus Valencia. Safran-Reis, gekocht mit Huhn, Kaninchen und grünen Bohnen in einer großen, flachen Pfanne. Das Highlight ist der 'Socarrat' - eine köstliche, leicht angebratene Reiskruste am Boden der Pfanne.",
    prepTime: "30 Min.",
    cookTime: "45 Min.",
    totalTime: "1 Std. 15 Min.",
    servings: "6-8 Personen",
    difficulty: "Mittel",
    ingredients: [
        {
            sectionTitle: "Zutaten",
            items: [
                { quantity: "500", unit: "g", name: "Paella-Reis (Bomba oder Calasparra)" },
                { quantity: "1", unit: "Stk.", name: "Hähnchen, in Teilen" },
                { quantity: "0.5", unit: "Stk.", name: "Kaninchen, in Teilen" },
                { quantity: "200", unit: "g", name: "grüne Bohnen" },
                { quantity: "150", unit: "g", name: "Garrofó (weiße Riesenbohnen)" },
                { quantity: "1", unit: "Stk.", name: "reife Tomate, gerieben" },
                { quantity: "1.5", unit: "l", name: "Wasser oder Hühnerbrühe" },
                { quantity: "1", unit: "Briefchen", name: "Safranfäden" },
                { quantity: "1", unit: "TL", name: "geräuchertes Paprikapulver (Pimentón)" },
                { quantity: "", unit: "", name: "Olivenöl, Salz" }
            ]
        }
    ],
    instructions: [
        "Eine große, flache Paella-Pfanne mit Olivenöl erhitzen. Die gesalzenen Hähnchen- und Kaninchenteile darin bei mittlerer Hitze goldbraun anbraten. An den Rand der Pfanne schieben.",
        "In der Mitte der Pfanne die grünen Bohnen und die Garrofó-Bohnen anbraten.",
        "Die geriebene Tomate und das Paprikapulver in die Mitte geben und kurz mitrösten.",
        "Alles vermischen und mit dem heißen Wasser oder der Brühe ablöschen. Safran hinzufügen und alles aufkochen lassen. Ca. 20 Minuten köcheln lassen.",
        "Den Reis gleichmäßig in der Pfanne verteilen. Ab jetzt nicht mehr umrühren!",
        "Die Paella bei mittlerer Hitze ca. 10 Minuten kochen, dann die Hitze reduzieren und weitere 8-10 Minuten köcheln lassen, bis der Reis die gesamte Flüssigkeit aufgesogen hat.",
        "Für den 'Socarrat' die Hitze am Ende für ca. 1 Minute hochdrehen, bis es am Boden leicht knistert und duftet.",
        "Die Pfanne vom Herd nehmen, mit einem sauberen Küchentuch oder Alufolie abdecken und 5-10 Minuten ruhen lassen. Mit Zitronenspalten servieren."
    ],
    nutritionPerServing: { calories: "780 kcal", protein: "35 g", fat: "30 g", carbs: "85 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Spanisch"],
      occasion: ["Für Gäste", "Sommer"],
      mainIngredient: ["Huhn", "Reis"],
      prepMethod: ["Pfannengericht"],
      diet: []
    },
    expertTips: [
        {
            title: "Nicht umrühren!",
            content: "Sobald der Reis in der Pfanne ist, darf nicht mehr gerührt werden. Dies ist entscheidend, damit sich die Stärke gleichmäßig verteilt und am Boden der begehrte 'Socarrat' entstehen kann."
        }
    ]
  },
  {
    recipeTitle: "Tortilla Española (Spanisches Kartoffelomelett)",
    shortDescription: "Ein spanischer Nationalstolz und ein Klassiker jeder Tapas-Bar. Ein dickes, saftiges Omelett aus langsam in Olivenöl gegarten Kartoffeln und Zwiebeln, gebunden mit Eiern. Schmeckt warm als Hauptgericht oder kalt in Würfel geschnitten.",
    prepTime: "15 Min.",
    cookTime: "25 Min.",
    totalTime: "40 Min.",
    servings: "4-6 Personen",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "500", unit: "g", name: "festkochende Kartoffeln" },
            { quantity: "1", unit: "Stk.", name: "große Zwiebel" },
            { quantity: "6", unit: "Stk.", name: "Eier" },
            { quantity: "200", unit: "ml", name: "Olivenöl" },
            { quantity: "", unit: "", name: "Salz" }
        ]
      }
    ],
    instructions: [
        "Die Kartoffeln schälen und in dünne, ungleichmäßige Scheiben schneiden. Die Zwiebel in feine Streifen schneiden.",
        "Das Olivenöl in einer beschichteten Pfanne (ca. 24 cm) bei mittlerer Hitze erwärmen. Kartoffeln und Zwiebeln hinzufügen und salzen.",
        "Die Kartoffeln und Zwiebeln im Öl bei niedriger bis mittlerer Hitze langsam garen, nicht braten. Sie sollten weich und confiert sein. Das dauert ca. 15-20 Minuten.",
        "In einer großen Schüssel die Eier verquirlen und kräftig salzen.",
        "Die gegarten Kartoffeln und Zwiebeln mit einem Schaumlöffel aus dem Öl heben und zur Eimischung geben. Das überschüssige Öl in der Pfanne lassen (ca. 2-3 EL). Gut vermischen und 5 Minuten ziehen lassen.",
        "Die Pfanne wieder erhitzen. Die Kartoffel-Ei-Mischung hineingeben und bei niedriger Hitze stocken lassen. Mit einem Spatel den Rand immer wieder lösen.",
        "Wenn die Unterseite goldbraun und die Oberfläche noch leicht flüssig ist, einen großen Teller auf die Pfanne legen und die Tortilla mit einer schnellen Bewegung wenden.",
        "Die Tortilla zurück in die Pfanne gleiten lassen und die andere Seite ebenfalls einige Minuten goldbraun backen. Die Mitte sollte noch saftig sein ('jugosa').",
        "Auf einen Teller gleiten lassen und vor dem Anschneiden kurz ruhen lassen."
    ],
    nutritionPerServing: { calories: "350 kcal", protein: "15 g", fat: "22 g", carbs: "24 g" },
    tags: {
      course: ["Hauptgericht", "Vorspeise"],
      cuisine: ["Spanisch"],
      occasion: ["Alltagsküche", "Party"],
      mainIngredient: ["Kartoffel", "Ei"],
      prepMethod: ["Pfannengericht"],
      diet: ["Vegetarisch", "Glutenfrei"]
    },
    expertTips: [
        {
            title: "Der Wendepunkt",
            content: "Das Wenden der Tortilla erfordert etwas Mut. Verwenden Sie einen Teller, der größer als die Pfanne ist. Halten Sie ihn fest an die Pfanne gedrückt und wenden Sie beides mit einer schnellen, entschlossenen Bewegung."
        }
    ]
  },
  {
    recipeTitle: "Gazpacho Andaluz (Kalte Tomatensuppe)",
    shortDescription: "Eine erfrischende, ungekochte Gemüsesuppe aus Andalusien, perfekt für heiße Sommertage. Reife Tomaten, Gurke, Paprika und Knoblauch werden zu einer samtigen, kühlen Suppe püriert, die als Vorspeise oder leichtes Hauptgericht serviert wird.",
    prepTime: "15 Min.",
    cookTime: "0 Min.",
    totalTime: "15 Min. (+ mind. 1 Std. Kühlzeit)",
    servings: "4 Personen",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "1", unit: "kg", name: "reife Tomaten" },
            { quantity: "1", unit: "Stk.", name: "Salatgurke" },
            { quantity: "1", unit: "Stk.", name: "grüne Paprika" },
            { quantity: "1", unit: "Stk.", name: "Zwiebel" },
            { quantity: "1", unit: "Stk.", name: "Knoblauchzehe" },
            { quantity: "100", unit: "ml", name: "Olivenöl" },
            { quantity: "3", unit: "EL", name: "Sherry-Essig" }
        ]
      }
    ],
    instructions: [
        "Das Gemüse waschen und grob zerkleinern. Die Gurke schälen.",
        "Alle Gemüsesorten zusammen mit dem Knoblauch in einen leistungsstarken Mixer geben.",
        "Das Olivenöl, den Sherry-Essig und eine gute Prise Salz hinzufügen.",
        "Alles auf höchster Stufe mixen, bis eine glatte, homogene Suppe entsteht. Bei Bedarf etwas kaltes Wasser hinzufügen, um die gewünschte Konsistenz zu erreichen.",
        "Die Gazpacho durch ein feines Sieb passieren, um eine besonders samtige Textur zu erhalten.",
        "Die Suppe mit Salz und Essig abschmecken und für mindestens 1 Stunde im Kühlschrank kalt stellen.",
        "Kalt servieren, traditionell mit kleinen Schälchen mit Toppings wie fein gewürfelten Gurken, Paprika, Zwiebeln und Croutons."
    ],
    nutritionPerServing: { calories: "250 kcal", protein: "5 g", fat: "18 g", carbs: "20 g" },
    tags: {
      course: ["Vorspeise", "Hauptgericht"],
      cuisine: ["Spanisch"],
      occasion: ["Sommer"],
      mainIngredient: ["Gemüse"],
      prepMethod: ["Ohne Kochen"],
      diet: ["Vegan", "Vegetarisch"]
    },
    expertTips: [
        {
            title: "Die besten Tomaten",
            content: "Der Geschmack der Gazpacho hängt vollständig von der Qualität der Zutaten ab. Verwenden Sie die reifsten, aromatischsten Sommertomaten, die Sie finden können."
        }
    ]
  },
  {
    recipeTitle: "Patatas Bravas (mit authentischer Salsa Brava)",
    shortDescription: "Der unangefochtene König der spanischen Tapas-Bars. Knusprig frittierte Kartoffelwürfel, serviert mit einer pikanten, rauchigen Tomatensauce (Salsa Brava). Oft wird dazu eine cremige Knoblauch-Aioli gereicht.",
    prepTime: "15 Min.",
    cookTime: "20 Min.",
    totalTime: "35 Min.",
    servings: "4 Personen (als Tapa)",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Für die Kartoffeln",
        items: [
            { quantity: "500", unit: "g", name: "festkochende Kartoffeln" },
            { quantity: "", unit: "", name: "Olivenöl zum Frittieren" }
        ]
      },
      {
        sectionTitle: "Für die Salsa Brava",
        items: [
            { quantity: "200", unit: "g", name: "gehackte Tomaten" },
            { quantity: "1", unit: "TL", name: "scharfes Paprikapulver" },
            { quantity: "1", unit: "TL", name: "geräuchertes Paprikapulver" },
            { quantity: "1", unit: "Schuss", name: "Essig" },
            { quantity: "", unit: "", name: "Salz, Zucker" }
        ]
      }
    ],
    instructions: [
        "Für die Salsa Brava die Tomaten mit den beiden Paprikapulvern, Essig, einer Prise Salz und Zucker in einem kleinen Topf aufkochen. Bei schwacher Hitze 10-15 Minuten köcheln lassen, bis die Soße etwas eingedickt ist. Pürieren und beiseitestellen.",
        "Die Kartoffeln schälen und in mundgerechte, ungleichmäßige Würfel schneiden.",
        "In einer tiefen Pfanne oder einem Topf reichlich Olivenöl erhitzen (ca. 170°C).",
        "Die Kartoffelwürfel in das heiße Öl geben und goldbraun und knusprig frittieren. Das kann in zwei Etappen geschehen, um die Temperatur des Öls zu halten.",
        "Die fertigen Kartoffeln mit einer Schaumkelle aus dem Öl heben, auf Küchenpapier abtropfen lassen und salzen.",
        "Die heißen Kartoffeln auf einer Platte anrichten, großzügig mit der Salsa Brava beträufeln und sofort servieren. Optional zusätzlich mit Aioli servieren."
    ],
    nutritionPerServing: { calories: "441 kcal", protein: "4 g", fat: "31 g", carbs: "39 g" },
    tags: {
      course: ["Vorspeise", "Beilage"],
      cuisine: ["Spanisch"],
      occasion: ["Party"],
      mainIngredient: ["Kartoffel"],
      prepMethod: ["Pfannengericht"],
      diet: ["Vegan", "Vegetarisch"]
    },
    expertTips: [
        {
            title: "Doppelt frittieren für extra Knusprigkeit",
            content: "Für ultimativ knusprige Kartoffeln können Sie sie zweimal frittieren: Zuerst bei niedrigerer Temperatur (ca. 140°C) garen, bis sie weich sind, dann abkühlen lassen und kurz vor dem Servieren bei hoher Temperatur (180°C) goldbraun und knusprig backen."
        }
    ]
  },
  {
    recipeTitle: "Gambas al Ajillo (Knoblauchgarnelen)",
    shortDescription: "Eine der schnellsten und beliebtesten Tapas Spaniens. Saftige Garnelen, die in reichlich Olivenöl mit Unmengen von Knoblauch und einem Hauch scharfer Chili brutzeln. Serviert wird direkt in der heißen Tonschale - perfekt, um das aromatische Öl mit frischem Brot aufzutunken.",
    prepTime: "10 Min.",
    cookTime: "5 Min.",
    totalTime: "15 Min.",
    servings: "4 Personen (als Tapa)",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "500", unit: "g", name: "rohe Garnelen, geschält" },
            { quantity: "6-8", unit: "Stk.", name: "Knoblauchzehen" },
            { quantity: "1", unit: "Stk.", name: "rote Chilischote" },
            { quantity: "150", unit: "ml", name: "gutes Olivenöl" },
            { quantity: "1", unit: "Schuss", name: "Sherry oder Weißwein" },
            { quantity: "1", unit: "Handvoll", name: "gehackte Petersilie" }
        ]
      }
    ],
    instructions: [
        "Den Knoblauch in dünne Scheiben schneiden. Die Chilischote entkernen und in feine Ringe schneiden.",
        "Das Olivenöl in einer Tonschale (Cazuela) oder einer schweren Pfanne bei mittlerer Hitze erwärmen.",
        "Knoblauch und Chili ins Öl geben und sanft braten, bis der Knoblauch anfängt, Farbe anzunehmen, aber nicht verbrennt.",
        "Die Hitze erhöhen, die Garnelen hinzufügen und unter Rühren 1-2 Minuten braten, bis sie rosa und gar sind.",
        "Einen Schuss Sherry oder Weißwein dazugeben, kurz aufzischen lassen. Mit Salz würzen.",
        "Die Pfanne vom Herd nehmen, die gehackte Petersilie darüber streuen und sofort brutzelnd heiß mit viel Weißbrot zum Auftunken des Öls servieren."
    ],
    nutritionPerServing: { calories: "355 kcal", protein: "35.5 g", fat: "23.7 g", carbs: "4.7 g" },
    tags: {
      course: ["Vorspeise"],
      cuisine: ["Spanisch"],
      occasion: ["Schnelle Küche", "Party"],
      mainIngredient: ["Garnelen"],
      prepMethod: ["Pfannengericht"],
      diet: []
    },
    expertTips: [
        {
            title: "Gute Zutaten sind alles",
            content: "Bei einem so einfachen Gericht ist die Qualität der Zutaten entscheidend. Verwenden Sie frische, hochwertige Garnelen und ein ausgezeichnetes Olivenöl für den besten Geschmack."
        }
    ]
  },
  {
    recipeTitle: "Bacalhau à Brás (Kabeljau nach Brás-Art)",
    shortDescription: "Eines der beliebtesten Nationalgerichte Portugals. Zarte Flocken von entsalztem Kabeljau (Bacalhau) werden mit feinen Zwiebeln, knusprigen Kartoffelstäbchen und cremigen Eiern vermischt. Ein einfaches, aber unglaublich geschmackvolles Gericht aus der Lissabonner Tavernenküche.",
    prepTime: "20 Min. (+ Entsalzungszeit)",
    cookTime: "20 Min.",
    totalTime: "40 Min. (+ Entsalzungszeit)",
    servings: "4 Personen",
    difficulty: "Einfach",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "400", unit: "g", name: "Stockfisch (Bacalhau), entsalzen" },
            { quantity: "500", unit: "g", name: "Kartoffeln, für Strohkartoffeln" },
            { quantity: "2", unit: "Stk.", name: "große Zwiebeln" },
            { quantity: "4", unit: "Stk.", name: "Eier" },
            { quantity: "", unit: "", name: "schwarze Oliven und Petersilie zum Garnieren" },
            { quantity: "", unit: "", name: "Olivenöl, Salz, Pfeffer" }
        ]
      }
    ],
    instructions: [
        "Den Bacalhau (falls nicht bereits entsalzen gekauft) 24-48 Stunden wässern, dabei das Wasser mehrmals wechseln. Dann kochen, Haut und Gräten entfernen und das Fleisch in feine Flocken zupfen.",
        "Die Kartoffeln schälen und mit einem Julienne-Schneider in sehr feine Streifen schneiden. Gut waschen und sehr gut trocken tupfen. In heißem Öl knusprig frittieren und auf Küchenpapier abtropfen lassen (oder fertige Strohkartoffeln verwenden).",
        "Die Zwiebeln in hauchdünne Halbringe schneiden.",
        "In einer großen Pfanne reichlich Olivenöl erhitzen und die Zwiebeln darin langsam weich und glasig dünsten.",
        "Die Bacalhau-Flocken hinzufügen und einige Minuten mit den Zwiebeln mitdünsten.",
        "Die Strohkartoffeln unterheben und alles gut vermischen.",
        "Die Eier in einer Schüssel leicht verquirlen und mit Salz und Pfeffer würzen. Über die Bacalhau-Mischung gießen.",
        "Bei schwacher Hitze unter ständigem Rühren stocken lassen, bis die Eier cremig, aber nicht trocken sind.",
        "Sofort auf Tellern anrichten und mit schwarzen Oliven und gehackter Petersilie garnieren."
    ],
    nutritionPerServing: { calories: "320 kcal", protein: "20 g", fat: "15 g", carbs: "30 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Portugiesisch"],
      occasion: ["Alltagsküche"],
      mainIngredient: ["Fisch", "Kartoffel"],
      prepMethod: ["Pfannengericht"],
      diet: []
    },
    expertTips: [
        {
            title: "Cremige Eier",
            content: "Das Geheimnis liegt darin, die Pfanne vom Herd zu ziehen, sobald die Eier cremig zu stocken beginnen. Die Resthitze gart sie perfekt fertig. Das Ergebnis sollte saftig und nicht trocken sein."
        }
    ]
  },
  {
    recipeTitle: "Cataplana de Marisco (Meeresfrüchte-Eintopf)",
    shortDescription: "Ein spektakulärer Meeresfrüchteeintopf von der Algarveküste, benannt nach dem traditionellen, muschelförmigen Kupfertopf, in dem er gegart wird. Verschiedene Fische und Meeresfrüchte werden in einer aromatischen Sauce aus Tomaten, Paprika, Zwiebeln und Weißwein gedämpft.",
    prepTime: "25 Min.",
    cookTime: "20 Min.",
    totalTime: "45 Min.",
    servings: "4 Personen",
    difficulty: "Mittel",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "1", unit: "kg", name: "gemischte Meeresfrüchte und Fischfilets" },
            { quantity: "1", unit: "Stk.", name: "Zwiebel" },
            { quantity: "1", unit: "Stk.", name: "rote Paprika" },
            { quantity: "400", unit: "g", name: "gehackte Tomaten" },
            { quantity: "150", unit: "ml", name: "Weißwein" },
            { quantity: "1", unit: "Bund", name: "Koriander" },
            { quantity: "2", unit: "Stk.", name: "Knoblauchzehen" },
            { quantity: "1", unit: "Prise", name: "Piri-Piri (Chili)" }
        ]
      }
    ],
    instructions: [
        "Zwiebel, Paprika und Knoblauch in Scheiben bzw. Streifen schneiden.",
        "Den Boden einer Cataplana (oder eines breiten Topfes mit Deckel) mit Olivenöl bedecken.",
        "Die Zutaten in Schichten in die Cataplana geben: zuerst die Hälfte der Zwiebeln, Paprika und Tomaten. Dann den Fisch und die Meeresfrüchte (festere Sorten zuerst). Mit den restlichen Zwiebeln, Paprika und Tomaten bedecken.",
        "Knoblauch, gehackten Koriander, Piri-Piri, Salz und Pfeffer darüber streuen.",
        "Den Weißwein angießen.",
        "Die Cataplana schließen und bei mittlerer Hitze ca. 15-20 Minuten garen, bis alle Meeresfrüchte gar sind. Die Cataplana während des Garens gelegentlich schütteln.",
        "Die geschlossene Cataplana auf den Tisch stellen und vor den Gästen öffnen. Mit frischem Brot servieren."
    ],
    nutritionPerServing: { calories: "385 kcal", protein: "22 g", fat: "17 g", carbs: "9 g" },
    tags: {
      course: ["Hauptgericht"],
      cuisine: ["Portugiesisch"],
      occasion: ["Für Gäste", "Sommer"],
      mainIngredient: ["Fisch", "Garnelen"],
      prepMethod: ["One-Pot"],
      diet: []
    },
    expertTips: [
        {
            title: "Ohne Cataplana-Topf",
            content: "Wenn Sie keine Cataplana besitzen, funktioniert auch ein Wok mit Deckel oder ein breiter Schmortopf sehr gut. Wichtig ist, dass der Deckel gut schließt, damit die Meeresfrüchte im Dampf garen."
        }
    ]
  },
  {
    recipeTitle: "Pastéis de Nata (Puddingtörtchen aus Blätterteig)",
    shortDescription: "Portugals berühmtestes Gebäck. Knusprige, blättrige Teigkörbchen, gefüllt mit einer reichhaltigen Eierpudding-Creme, die bei hoher Hitze gebacken wird, um die charakteristischen dunklen, karamellisierten Flecken auf der Oberfläche zu erzeugen.",
    prepTime: "25 Min. (+ Kühlzeit)",
    cookTime: "15 Min.",
    totalTime: "40 Min. (+ Kühlzeit)",
    servings: "12 Törtchen",
    difficulty: "Anspruchsvoll",
    ingredients: [
      {
        sectionTitle: "Zutaten",
        items: [
            { quantity: "1", unit: "Rolle", name: "Blätterteig, gekühlt" },
            { quantity: "250", unit: "ml", name: "Milch" },
            { quantity: "1", unit: "Stk.", name: "Zimtstange" },
            { quantity: "1", unit: "Streifen", name: "Bio-Zitronenschale" }
        ]
      },
      {
        sectionTitle: "Für den Zuckersirup",
        items: [
            { quantity: "200", unit: "g", name: "Zucker" },
            { quantity: "100", unit: "ml", name: "Wasser" }
        ]
      },
      {
        sectionTitle: "Für die Puddingcreme",
        items: [
            { quantity: "30", unit: "g", name: "Mehl" },
            { quantity: "6", unit: "Stk.", name: "Eigelb" }
        ]
      }
    ],
    instructions: [
        "Den Backofen auf die höchstmögliche Temperatur (ca. 250-270°C) vorheizen. Ein 12er-Muffinblech bereitstellen.",
        "Den Blätterteig eng aufrollen und in 12 gleichmäßige Scheiben schneiden.",
        "Jede Teigscheibe mit der Schnittfläche nach oben in eine Muffinmulde legen. Mit angefeuchteten Daumen den Teig von der Mitte nach außen an den Boden und die Wände drücken, sodass ein dünnes Körbchen entsteht.",
        "Für die Creme den Zuckersirup aus Zucker und Wasser kochen, bis er leicht andickt. Beiseitestellen.",
        "Milch mit Zimtstange und Zitronenschale aufkochen. In einer Schüssel das Mehl mit etwas kalter Milch glatt rühren, dann in die heiße Milch einrühren und unter Rühren andicken lassen.",
        "Zimt und Zitrone entfernen. Den heißen Zuckersirup langsam unter die Milchcreme rühren.",
        "Die Eigelbe in einer separaten Schüssel verquirlen. Etwas von der heißen Creme zu den Eigelben geben, um sie zu temperieren, dann alles zurück zur restlichen Creme geben und gut verrühren.",
        "Die noch warme Creme in die Teigkörbchen füllen.",
        "Im sehr heißen Ofen 12-17 Minuten backen, bis der Teig goldbraun ist und die Oberfläche der Creme die charakteristischen dunklen, fast verbrannten Flecken aufweist.",
        "Kurz abkühlen lassen und am besten noch lauwarm, mit Zimt und Puderzucker bestreut, genießen."
    ],
    nutritionPerServing: { calories: "150 kcal", protein: "2 g", fat: "6 g", carbs: "21 g" },
    tags: {
      course: ["Dessert", "Snack"],
      cuisine: ["Portugiesisch"],
      occasion: ["Für Gäste"],
      mainIngredient: ["Ei"],
      prepMethod: ["Ofengericht"],
      diet: ["Vegetarisch"]
    },
    expertTips: [
        {
            title: "Hohe Hitze ist entscheidend",
            content: "Die hohe Backtemperatur ist der Schlüssel zum Erfolg. Sie sorgt dafür, dass der Blätterteig knusprig wird und die Creme schnell stockt und die typischen karamellisierten Flecken bekommt, ohne dass der Teig durchweicht."
        }
    ]
  }
];