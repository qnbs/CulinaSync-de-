import jsPDF from 'jspdf';
import Papa from 'papaparse';
import { Recipe, ShoppingListItem } from '@/types';

// =======================================================================
// RECIPE EXPORT
// =======================================================================

const generateRecipeText = (recipe: Recipe): string => {
  let content = `REZEPT: ${recipe.recipeTitle}\n`;
  content += `========================================\n\n`;
  content += `${recipe.shortDescription}\n\n`;
  content += `DETAILS:\n`;
  content += `- Gesamtzeit: ${recipe.totalTime}\n`;
  content += `- Portionen: ${recipe.servings}\n`;
  content += `- Schwierigkeit: ${recipe.difficulty}\n\n`;
  content += `ZUTATEN:\n`;
  recipe.ingredients.forEach(group => {
    if (group.sectionTitle) content += `\n${group.sectionTitle}:\n`;
    group.items.forEach(item => {
      content += `- ${item.quantity || ''} ${item.unit || ''} ${item.name}`.trim() + '\n';
    });
  });
  content += `\nANLEITUNG:\n`;
  recipe.instructions.forEach((step, index) => {
    content += `${index + 1}. ${step}\n`;
  });
  if (recipe.expertTips && recipe.expertTips.length > 0) {
      content += `\nEXPERTENTIPPS:\n`;
      recipe.expertTips.forEach(tip => {
          content += `\n- ${tip.title}:\n${tip.content}\n`;
      });
  }
  return content;
};

const generateRecipeMarkdown = (recipe: Recipe): string => {
  let content = `# ${recipe.recipeTitle}\n\n`;
  content += `*${recipe.shortDescription}*\n\n`;
  content += `**Gesamtzeit:** ${recipe.totalTime} | **Portionen:** ${recipe.servings} | **Schwierigkeit:** ${recipe.difficulty}\n\n`;
  content += `## Zutaten\n\n`;
  recipe.ingredients.forEach(group => {
    if (group.sectionTitle) content += `### ${group.sectionTitle}\n`;
    group.items.forEach(item => {
      content += `- ${item.quantity || ''} ${item.unit || ''} ${item.name}`.trim() + '\n';
    });
    content += '\n';
  });
  content += `## Anleitung\n\n`;
  recipe.instructions.forEach((step, index) => {
    content += `${index + 1}. ${step}\n`;
  });
   if (recipe.expertTips && recipe.expertTips.length > 0) {
      content += `\n## Expertentipps\n\n`;
      recipe.expertTips.forEach(tip => {
          content += `### ${tip.title}\n${tip.content}\n\n`;
      });
  }
  return content;
};

export const exportRecipeToPdf = (recipe: Recipe) => {
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(22);
  doc.setTextColor("#d97706"); // amber-500
  doc.text(recipe.recipeTitle, 15, y);
  y += 10;

  doc.setFontSize(11);
  doc.setTextColor("#333333");
  const descriptionLines = doc.splitTextToSize(recipe.shortDescription, 180);
  doc.text(descriptionLines, 15, y);
  y += descriptionLines.length * 5 + 8;
  
  doc.setDrawColor("#3f3f46"); // zinc-700
  doc.line(15, y-4, 195, y-4);

  const info = `${recipe.totalTime} | ${recipe.servings} | ${recipe.difficulty}`;
  doc.setFontSize(10);
  doc.setTextColor("#666666");
  doc.text(info, 15, y);
  y += 10;

  doc.setFontSize(16);
  doc.setTextColor("#000000");
  doc.text("Zutaten", 15, y);
  y += 8;

  doc.setFontSize(11);
  doc.setTextColor("#333333");
  recipe.ingredients.forEach(group => {
      if(group.sectionTitle) {
          doc.setFont(undefined, 'bold');
          doc.text(group.sectionTitle, 15, y);
          doc.setFont(undefined, 'normal');
          y+= 6;
      }
      group.items.forEach(item => {
          if (y > 280) { doc.addPage(); y = 20; }
          doc.text(`• ${item.quantity || ''} ${item.unit || ''} ${item.name}`.trim(), 20, y);
          y+=6;
      });
      y+=2;
  });
  
  if (y > 250) { doc.addPage(); y = 20; }
  y+=5;
  doc.setFontSize(16);
  doc.setTextColor("#000000");
  doc.text("Anleitung", 15, y);
  y += 8;
  
  doc.setFontSize(11);
  doc.setTextColor("#333333");
  recipe.instructions.forEach((step, index) => {
      const stepText = `${index + 1}. ${step}`;
      const stepLines = doc.splitTextToSize(stepText, 175);
      if (y + (stepLines.length * 5) > 280) {
          doc.addPage();
          y = 20;
      }
      doc.text(stepLines, 15, y);
      y += stepLines.length * 5 + 4;
  });

  doc.save(`${recipe.recipeTitle.replace(/\s/g, '_')}.pdf`);
};

export const exportRecipeToCsv = (recipe: Recipe) => {
    const data: any[] = [];
    recipe.ingredients.forEach(group => {
        group.items.forEach(item => {
            data.push({
                'Typ': 'Zutat',
                'Gruppe': group.sectionTitle || '',
                'Menge': item.quantity,
                'Einheit': item.unit,
                'Name': item.name,
                'Details': ''
            });
        });
    });
    recipe.instructions.forEach((step, index) => {
        data.push({
            'Typ': 'Anleitung',
            'Gruppe': `Schritt ${index + 1}`,
            'Menge': '',
            'Einheit': '',
            'Name': '',
            'Details': step
        });
    });
    const csv = Papa.unparse(data);
    downloadFile(csv, `${recipe.recipeTitle.replace(/\s/g, '_')}.csv`, 'text/csv;charset=utf-8;');
};

export const exportRecipeToMarkdown = (recipe: Recipe) => {
    const content = generateRecipeMarkdown(recipe);
    downloadFile(content, `${recipe.recipeTitle.replace(/\s/g, '_')}.md`, 'text/markdown;charset=utf-8;');
};

export const exportRecipeToTxt = (recipe: Recipe) => {
    const content = generateRecipeText(recipe);
    downloadFile(content, `${recipe.recipeTitle.replace(/\s/g, '_')}.txt`, 'text/plain;charset=utf-8;');
};

// =======================================================================
// SHOPPING LIST EXPORT
// =======================================================================

const groupShoppingList = (items: ShoppingListItem[]) => items.reduce((acc, item) => {
    const category = getCategoryForItem(item.name);
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
}, {} as Record<string, ShoppingListItem[]>);


const generateShoppingListText = (items: ShoppingListItem[]) => {
    const grouped = groupShoppingList(items);
    let content = "EINKAUFSLISTE\n====================\n\n";
    for (const category of Object.keys(grouped).sort()) {
        content += `${category.toUpperCase()}:\n`;
        grouped[category].forEach(item => {
            content += `[${item.isChecked ? 'x' : ' '}] ${item.name} (${item.quantity} ${item.unit})\n`;
        });
        content += '\n';
    }
    return content;
};

const generateShoppingListMarkdown = (items: ShoppingListItem[]) => {
    const grouped = groupShoppingList(items);
    let content = "# Einkaufsliste\n\n";
    for (const category of Object.keys(grouped).sort()) {
        content += `## ${category}\n`;
        grouped[category].forEach(item => {
            content += `- [${item.isChecked ? 'x' : ' '}] ${item.name} (*${item.quantity} ${item.unit}*)\n`;
        });
        content += '\n';
    }
    return content;
};


export const exportShoppingListToPdf = (items: ShoppingListItem[]) => {
    if (items.length === 0) return;
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(22);
    doc.text("Einkaufsliste", 15, y);
    y += 15;

    const grouped = groupShoppingList(items);
    for (const category of Object.keys(grouped).sort()) {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(category, 15, y);
        y += 8;
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        grouped[category].forEach(item => {
            if (y > 280) { doc.addPage(); y = 20; }
            doc.text(`[ ] ${item.name} (${item.quantity} ${item.unit})`, 20, y);
            y += 7;
        });
        y += 5;
    }
    doc.save("einkaufsliste.pdf");
};

export const exportShoppingListToCsv = (items: ShoppingListItem[]) => {
    if (items.length === 0) return;
    const dataToExport = items.map(item => ({
        'Abgehakt': item.isChecked ? 'Ja' : 'Nein',
        'Menge': item.quantity,
        'Einheit': item.unit,
        'Artikel': item.name,
        'Kategorie': getCategoryForItem(item.name)
    }));
    const csv = Papa.unparse(dataToExport);
    downloadFile(csv, 'einkaufsliste.csv', 'text/csv;charset=utf-8;');
}

export const exportShoppingListToMarkdown = (items: ShoppingListItem[]) => {
    if (items.length === 0) return;
    const content = generateShoppingListMarkdown(items);
    downloadFile(content, 'einkaufsliste.md', 'text/markdown;charset=utf-8;');
};

export const exportShoppingListToTxt = (items: ShoppingListItem[]) => {
    if (items.length === 0) return;
    const content = generateShoppingListText(items);
    downloadFile(content, 'einkaufsliste.txt', 'text/plain;charset=utf-8;');
};

// =======================================================================
// HELPER FUNCTIONS
// =======================================================================

const getCategoryForItem = (itemName: string): string => {
    const name = itemName.toLowerCase();
    if (['milch', 'joghurt', 'käse', 'butter', 'sahne', 'quark', 'feta', 'ei', 'eier'].some(s => name.includes(s))) return 'Milchprodukte & Eier';
    if (['apfel', 'banane', 'tomate', 'zwiebel', 'knoblauch', 'karotte', 'salat', 'paprika', 'spinat', 'gemüse', 'kartoffel', 'gurke', 'zucchini', 'lauch', 'petersilie', 'basilikum', 'schnittlauch'].some(s => name.includes(s))) return 'Obst & Gemüse';
    if (['huhn', 'rind', 'schwein', 'fisch', 'lachs', 'fleisch', 'wurst', 'hackfleisch'].some(s => name.includes(s))) return 'Fleisch & Fisch';
    if (['brot', 'brötchen', 'baguette', 'toast'].some(s => name.includes(s))) return 'Backwaren';
    if (['nudeln', 'reis', 'mehl', 'zucker', 'linsen', 'bohnen', 'pasta', 'haferflocken', 'müsli', 'kaffee', 'tee', 'couscous'].some(s => name.includes(s))) return 'Trockenwaren & Nudeln';
    if (['öl', 'essig', 'olivenöl'].some(s => name.includes(s))) return 'Öle & Essige';
    if (['tomatenmark', 'passata', 'kichererbsen', 'mais', 'oliven', 'konserve'].some(s => name.includes(s))) return 'Konserven & Gläser';
    if (['salz', 'pfeffer', 'paprika', 'curry', 'senf', 'ketchup', 'sojasauce', 'brühe'].some(s => name.includes(s))) return 'Gewürze & Saucen';
    return 'Sonstiges';
}

const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
