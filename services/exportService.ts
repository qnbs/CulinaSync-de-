import jsPDF from 'jspdf';
import Papa from 'papaparse';
import { Recipe, ShoppingListItem } from '../types';
import { getCategoryForItem } from './utils';
import { db } from './db';
import { loadSettings } from './settingsService';

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

export const exportRecipeToJson = (recipe: Recipe) => {
    const content = JSON.stringify(recipe, null, 2);
    downloadFile(content, `${recipe.recipeTitle.replace(/\s/g, '_')}.json`, 'application/json;charset=utf-8;');
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
    const category = item.category || getCategoryForItem(item.name);
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
        'Kategorie': item.category || getCategoryForItem(item.name)
    }));
    const csv = Papa.unparse(dataToExport);
    downloadFile(csv, 'einkaufsliste.csv', 'text/csv;charset=utf-8;');
}

export const exportShoppingListToJson = (items: ShoppingListItem[]) => {
    if (items.length === 0) return;
    const content = JSON.stringify(items, null, 2);
    downloadFile(content, `einkaufsliste.json`, 'application/json;charset=utf-8;');
};

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
// FULL DATA BACKUP
// =======================================================================

export const exportFullDataAsJson = async (): Promise<boolean> => {
    try {
        const allData = {
            pantry: await db.pantry.toArray(),
            recipes: await db.recipes.toArray(),
            mealPlan: await db.mealPlan.toArray(),
            shoppingList: await db.shoppingList.toArray(),
            settings: loadSettings(),
        };
        const dataStr = JSON.stringify(allData, null, 2);
        downloadFile(dataStr, `culinasync_backup_${new Date().toISOString().split('T')[0]}.json`, "application/json");
        return true;
    } catch (error) {
        console.error("Data export failed:", error);
        return false;
    }
}

export const exportFullDataAsTxt = async (): Promise<boolean> => {
     try {
        const data = {
            pantry: await db.pantry.toArray(),
            recipes: await db.recipes.toArray(),
            mealPlan: await db.mealPlan.toArray(),
            shoppingList: await db.shoppingList.toArray(),
            settings: loadSettings(),
        };
        
        let content = `CulinaSync Backup - ${new Date().toLocaleString('de-DE', { dateStyle: 'full', timeStyle: 'short' })}\n`;
        content += "===================================================\n\n";

        content += `VORRATSKAMMER (${data.pantry.length} Artikel)\n------------------------\n`;
        if (data.pantry.length > 0) {
            data.pantry.forEach(p => {
                const expiry = p.expiryDate ? ` | MHD: ${new Date(p.expiryDate).toLocaleDateString('de-DE')}` : '';
                content += `- ${p.name} (${p.quantity} ${p.unit})${expiry}\n`;
            });
        } else {
            content += "Keine Artikel im Vorrat.\n";
        }
        
        content += `\n\nREZEPTE (${data.recipes.length} gespeichert)\n------------------------\n`;
         if (data.recipes.length > 0) {
            data.recipes.forEach(r => {
                content += `- ${r.recipeTitle} (${r.difficulty}, ${r.totalTime})\n`;
            });
        } else {
            content += "Keine Rezepte gespeichert.\n";
        }


        content += `\n\nESSENSPLAN (${data.mealPlan.length} Einträge)\n------------------------\n`;
        if (data.mealPlan.length > 0) {
            data.mealPlan.sort((a,b) => a.date.localeCompare(b.date)).forEach(m => {
                const recipeTitle = data.recipes.find(r => r.id === m.recipeId)?.recipeTitle || m.note;
                const formattedDate = new Date(m.date);
                formattedDate.setMinutes(formattedDate.getMinutes() + formattedDate.getTimezoneOffset());
                const dateString = formattedDate.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
                content += `- ${dateString} (${m.mealType}): ${recipeTitle}\n`;
            });
        } else {
            content += "Keine Mahlzeiten geplant.\n";
        }
        
        content += `\n\nEINKAUFSLISTE (${data.shoppingList.length} Artikel)\n------------------------\n`;
        if (data.shoppingList.length > 0) {
            content += "Offen:\n";
            data.shoppingList.filter(s => !s.isChecked).forEach(s => {
                content += `  [ ] ${s.name} (${s.quantity} ${s.unit})\n`;
            });
            content += "\nErledigt:\n";
             data.shoppingList.filter(s => s.isChecked).forEach(s => {
                content += `  [x] ${s.name} (${s.quantity} ${s.unit})\n`;
            });
        } else {
            content += "Einkaufsliste ist leer.\n";
        }

        content += `\n\nEINSTELLUNGEN\n------------------------\n`;
        content += JSON.stringify(data.settings, null, 2);

        downloadFile(content, `culinasync_backup_${new Date().toISOString().split('T')[0]}.txt`, "text/plain");
        return true;
    } catch (error) {
        console.error("Data export failed:", error);
        return false;
    }
}

export const exportFullDataAsMarkdown = async (): Promise<boolean> => {
    try {
        const data = {
            pantry: await db.pantry.toArray(),
            recipes: await db.recipes.toArray(),
            mealPlan: await db.mealPlan.toArray(),
            shoppingList: await db.shoppingList.toArray(),
            settings: loadSettings(),
        };
        
        let content = `# CulinaSync Backup\n\n**Datum:** ${new Date().toLocaleString('de-DE')}\n\n`;

        content += `## Vorratskammer (${data.pantry.length} Artikel)\n\n`;
        if (data.pantry.length > 0) {
            data.pantry.forEach(p => {
                const expiry = p.expiryDate ? ` | **MHD:** ${new Date(p.expiryDate).toLocaleDateString('de-DE')}` : '';
                content += `- **${p.name}** (${p.quantity} ${p.unit})${expiry}\n`;
            });
        } else {
            content += "Keine Artikel im Vorrat.\n";
        }
        
        content += `\n## Rezepte (${data.recipes.length} gespeichert)\n\n`;
        if (data.recipes.length > 0) {
            data.recipes.forEach(r => {
                content += `- ${r.recipeTitle} (*${r.difficulty}, ${r.totalTime}*)\n`;
            });
        } else {
            content += "Keine Rezepte gespeichert.\n";
        }

        content += `\n## Essensplan (${data.mealPlan.length} Einträge)\n\n`;
        if (data.mealPlan.length > 0) {
            data.mealPlan.sort((a,b) => a.date.localeCompare(b.date)).forEach(m => {
                const recipeTitle = data.recipes.find(r => r.id === m.recipeId)?.recipeTitle || m.note;
                const d = new Date(m.date);
                d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
                const dateString = d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
                content += `- **${dateString} (${m.mealType}):** ${recipeTitle}\n`;
            });
        } else {
            content += "Keine Mahlzeiten geplant.\n";
        }
        
        content += `\n## Einkaufsliste (${data.shoppingList.length} Artikel)\n\n`;
        const groupedShoppingList = groupShoppingList(data.shoppingList);
        for (const category of Object.keys(groupedShoppingList).sort()) {
            content += `### ${category}\n`;
            groupedShoppingList[category].forEach(item => {
                content += `- [${item.isChecked ? 'x' : ' '}] ${item.name} (*${item.quantity} ${item.unit}*)\n`;
            });
            content += '\n';
        }

        content += `\n## Einstellungen\n\n\`\`\`json\n${JSON.stringify(data.settings, null, 2)}\n\`\`\``;

        downloadFile(content, `culinasync_backup_${new Date().toISOString().split('T')[0]}.md`, "text/markdown;charset=utf-8;");
        return true;
    } catch (error) {
        console.error("Markdown data export failed:", error);
        return false;
    }
}

export const exportFullDataAsCsv = async (): Promise<boolean> => {
    try {
        const allData = {
            pantry: await db.pantry.toArray(),
            recipes: await db.recipes.toArray(),
            mealPlan: await db.mealPlan.toArray(),
            shoppingList: await db.shoppingList.toArray(),
        };

        const csvParts: string[] = [];

        if (allData.pantry.length > 0) {
            const pantryData = allData.pantry.map(({ id, ...rest }) => rest);
            csvParts.push("VORRATSKAMMER", Papa.unparse(pantryData));
        }
        
        if (allData.recipes.length > 0) {
            const recipeData = allData.recipes.map(r => ({
                Titel: r.recipeTitle,
                Beschreibung: r.shortDescription,
                Zeit: r.totalTime,
                Portionen: r.servings,
                Schwierigkeit: r.difficulty,
                Favorit: r.isFavorite ? 'Ja' : 'Nein'
            }));
            csvParts.push("REZEPTE", Papa.unparse(recipeData));
        }
        
        if (allData.mealPlan.length > 0) {
            const mealPlanData = allData.mealPlan.map(m => ({
                Datum: m.date,
                Mahlzeit: m.mealType,
                Rezept: allData.recipes.find(r => r.id === m.recipeId)?.recipeTitle || m.note,
                Gekocht: m.isCooked ? 'Ja' : 'Nein'
            }));
            csvParts.push("ESSENSPLAN", Papa.unparse(mealPlanData));
        }
        
        if (allData.shoppingList.length > 0) {
            const shoppingListData = allData.shoppingList.map(({ id, sortOrder, ...rest }) => rest);
            csvParts.push("EINKAUFSLISTE", Papa.unparse(shoppingListData));
        }

        const csvContent = csvParts.join('\n\n\n');
        downloadFile(csvContent, `culinasync_backup_${new Date().toISOString().split('T')[0]}.csv`, "text/csv;charset=utf-8;");
        return true;
    } catch(e) {
        console.error("CSV data export failed:", e);
        return false;
    }
};

const checkPageBreak = (y: number, doc: jsPDF, margin: number = 20): number => {
    if (y > 280) {
        doc.addPage();
        return margin;
    }
    return y;
};

export const exportFullDataAsPdf = async (): Promise<boolean> => {
    try {
        const doc = new jsPDF();
        let y = 20;

        const allData = {
            pantry: await db.pantry.toArray(),
            recipes: await db.recipes.toArray(),
            mealPlan: await db.mealPlan.toArray(),
            shoppingList: await db.shoppingList.toArray(),
            settings: loadSettings(),
        };

        // Title page
        doc.setFontSize(22);
        doc.text("CulinaSync - Daten-Backup", 105, y, { align: 'center' });
        y += 10;
        doc.setFontSize(12);
        doc.text(new Date().toLocaleString('de-DE'), 105, y, { align: 'center' });
        y += 20;
        
        doc.setFontSize(16);
        doc.text("Inhalt", 20, y);
        y += 10;
        doc.setFontSize(12);
        doc.text(`- Vorratskammer (${allData.pantry.length} Artikel)`, 25, y); y += 7;
        doc.text(`- Rezepte (${allData.recipes.length})`, 25, y); y += 7;
        doc.text(`- Essensplan (${allData.mealPlan.length} Einträge)`, 25, y); y += 7;
        doc.text(`- Einkaufsliste (${allData.shoppingList.length} Artikel)`, 25, y); y += 7;
        doc.text(`- Einstellungen`, 25, y);

        if(allData.pantry.length) {
            doc.addPage(); y = 20;
            doc.setFontSize(18); doc.text("Vorratskammer", 20, y); y += 10;
            doc.setFontSize(11);
            for (const item of allData.pantry) {
                y = checkPageBreak(y, doc);
                const expiry = item.expiryDate ? ` | MHD: ${new Date(item.expiryDate).toLocaleDateString('de-DE')}` : '';
                doc.text(`- ${item.name} (${item.quantity} ${item.unit})${expiry}`, 25, y);
                y += 7;
            }
        }

        if(allData.recipes.length) {
            doc.addPage(); y = 20;
            doc.setFontSize(18); doc.text("Rezepte", 20, y); y += 10;
            doc.setFontSize(11);
            for (const recipe of allData.recipes) {
                y = checkPageBreak(y, doc);
                doc.text(`- ${recipe.recipeTitle} (${recipe.difficulty}, ${recipe.totalTime})`, 25, y);
                y += 7;
            }
        }
        
        if(allData.mealPlan.length) {
            doc.addPage(); y = 20;
            doc.setFontSize(18); doc.text("Essensplan", 20, y); y += 10;
            doc.setFontSize(11);
            const sortedMeals = allData.mealPlan.sort((a,b) => a.date.localeCompare(b.date));
            for (const meal of sortedMeals) {
                y = checkPageBreak(y, doc);
                const recipeTitle = allData.recipes.find(r => r.id === meal.recipeId)?.recipeTitle || meal.note;
                const d = new Date(meal.date);
                d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
                const dateString = d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
                doc.text(`- ${dateString} (${meal.mealType}): ${recipeTitle}`, 25, y);
                y += 7;
            }
        }

        if(allData.shoppingList.length){
            doc.addPage(); y = 20;
            doc.setFontSize(18); doc.text("Einkaufsliste", 20, y); y += 10;
            const groupedShoppingList = groupShoppingList(allData.shoppingList);
            for (const category of Object.keys(groupedShoppingList).sort()) {
                y = checkPageBreak(y, doc, 30);
                doc.setFontSize(12); doc.setFont(undefined, 'bold');
                doc.text(category, 25, y);
                doc.setFont(undefined, 'normal'); y += 8;
                doc.setFontSize(11);
                for (const item of groupedShoppingList[category]) {
                    y = checkPageBreak(y, doc, 30);
                    doc.text(`  [${item.isChecked ? 'x' : ' '}] ${item.name} (${item.quantity} ${item.unit})`, 30, y);
                    y += 7;
                }
            }
        }
        
        doc.addPage(); y = 20;
        doc.setFontSize(18); doc.text("Einstellungen", 20, y); y += 10;
        doc.setFontSize(10);
        const settingsText = JSON.stringify(allData.settings, null, 2);
        const lines = doc.splitTextToSize(settingsText, 170);
        doc.text(lines, 25, y);

        doc.save(`culinasync_backup_${new Date().toISOString().split('T')[0]}.pdf`);
        return true;
    } catch (error) {
        console.error("PDF data export failed:", error);
        return false;
    }
};


// =======================================================================
// HELPER FUNCTIONS
// =======================================================================

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