// Constantes de sustancias (Copiadas del código Python original)
// acids
const ACIDS = ["HCl", "HBr", "HI", "HNO3", "HClO3", "HClO4"];
// bases
const BASES = ["LiOH", "NaOH", "KOH", "RbOH", "CsOH"];
// neutrals
const NEUTRALS = ["H2O (no molarity)", "NaCl", "KCl", "No substance"];

// Clase Substance portada de Python a JS
class Substance {
    constructor(formula, molarity, volume) {
        if (molarity < 0 || volume < 0) {
            throw new Error("Molarity and volume must have positive values.");
        }
        this._formula = formula;
        this._molarity = parseFloat(molarity);
        this._volume = parseFloat(volume);
        this._acidity = this._get_acidity();
    }

    _get_acidity() {
        if (ACIDS.includes(this._formula)) return "acid";
        if (BASES.includes(this._formula)) return "base";
        if (NEUTRALS.includes(this._formula)) return "neutral";
        return "neutral"; // Fallback
    }

    get_molarity() {
        return this._molarity;
    }

    get_volume() {
        return this._volume;
    }

    is_acid() {
        return this._acidity === "acid";
    }

    is_base() {
        return this._acidity === "base";
    }
}

// Lógica de cálculo (Funciones puras)

function getTotalVolume(substance1, substance2) {
    return substance1.get_volume() + substance2.get_volume();
}

function getProtonsConcentration(substance1, substance2, totalVolume) {
    let protons = 1e-7; // 0.0000001 (Aporte del agua)

    if (totalVolume === 0) return protons;

    if (substance1.is_acid()) {
        protons += (substance1.get_molarity() * substance1.get_volume()) / totalVolume;
    }
    if (substance2.is_acid()) {
        protons += (substance2.get_molarity() * substance2.get_volume()) / totalVolume;
    }
    return protons;
}

function getHydroxilsConcentration(substance1, substance2, totalVolume) {
    let hydroxils = 1e-7; // 0.0000001 (Aporte del agua)

    if (totalVolume === 0) return hydroxils;

    if (substance1.is_base()) {
        hydroxils += (substance1.get_molarity() * substance1.get_volume()) / totalVolume;
    }
    if (substance2.is_base()) {
        hydroxils += (substance2.get_molarity() * substance2.get_volume()) / totalVolume;
    }
    return hydroxils;
}

function getPH(protons, hydroxils) {
    const totalProtons = protons - hydroxils;

    let pH;
    // Usamos un epsilon pequeño para comparaciones flotantes si fuera necesario,
    // pero la lógica original de Python era directa > 0 o < 0.
    
    if (totalProtons > 0) {
        // Ácido dominante
        pH = -Math.log10(totalProtons);
    } else if (totalProtons < 0) {
        // Base dominante (totalProtons es negativo, así que hydroxils > protons)
        // La lógica original Python: total_hydroxils = -total_protons
        const totalHydroxils = -totalProtons;
        pH = 14 + Math.log10(totalHydroxils);
    } else {
        // Neutro exacto
        pH = 7;
    }
    return pH;
}

function validatePH(pH) {
    if (pH > 14) {
        return `Concentración de base inusualmente alta.`;
    } else if (pH < 0) {
        return `Concentración de ácido inusualmente alta.`;
    }
    return null; // OK
}

function getColorClass(pH) {
    // Redondeamos a 2 decimales para la lógica de color visual para evitar parpadeos en bordes
    const phVal = parseFloat(pH.toFixed(2));
    if (phVal < 7.00) return "result-acid";
    if (phVal > 7.00) return "result-base";
    return "result-neutral";
}


// --- Lógica de UI ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Rellenar los dropdowns
    const allOptions = [
        { label: "--- Ácidos Fuertes ---", disabled: true },
        ...ACIDS.map(f => ({ value: f, label: f })),
        { label: "--- Bases Fuertes ---", disabled: true },
        ...BASES.map(f => ({ value: f, label: f })),
        { label: "--- Neutros ---", disabled: true },
        ...NEUTRALS.map(f => ({ value: f, label: f }))
    ];

    const select1 = document.getElementById('formula1');
    const select2 = document.getElementById('formula2');

    function populateSelect(selectElement) {
        allOptions.forEach(opt => {
            const option = document.createElement('option');
            if (opt.disabled) {
                option.disabled = true;
                option.textContent = opt.label;
            } else {
                option.value = opt.value;
                option.textContent = opt.label;
            }
            selectElement.appendChild(option);
        });
    }

    populateSelect(select1);
    populateSelect(select2);

    // Selección por defecto (igual que en tu Python original, la segunda era la opción 12 aprox)
    // Pondremos valores por defecto razonables
    select1.value = ACIDS[0]; // HCl
    select2.value = NEUTRALS[3]; // No substance

    // 2. Manejar el click del botón
    const btn = document.getElementById('calculate-btn');
    const resultSection = document.getElementById('result-section');
    const resultBox = document.getElementById('result-box');
    const phValueSpan = document.getElementById('ph-value');
    const errorMsg = document.getElementById('error-message');

    btn.addEventListener('click', () => {
        // Limpiar estados previos
        errorMsg.classList.add('hidden');
        errorMsg.textContent = "";
        resultBox.className = ""; // Quitar clases de color

        // Obtener valores
        const f1 = select1.value;
        const m1 = parseFloat(document.getElementById('molarity1').value);
        const v1 = parseFloat(document.getElementById('volume1').value);

        const f2 = select2.value;
        // Si están vacíos, asumimos 0 (como en tu python original con los chequeos)
        const m2 = document.getElementById('molarity2').value ? parseFloat(document.getElementById('molarity2').value) : 0;
        const v2 = document.getElementById('volume2').value ? parseFloat(document.getElementById('volume2').value) : 0;

        // Validación básica de entrada sustancia 1
        if (isNaN(m1) || isNaN(v1)) {
            alert("Por favor, introduce valores numéricos válidos para la Sustancia 1.");
            return;
        }

        try {
            const s1 = new Substance(f1, m1, v1);
            const s2 = new Substance(f2, m2, v2);

            const totalVol = getTotalVolume(s1, s2);
            
            // Cálculos
            const protons = getProtonsConcentration(s1, s2, totalVol);
            const hydroxils = getHydroxilsConcentration(s1, s2, totalVol);
            const pH = getPH(protons, hydroxils);

            // Validaciones de rango
            const rangeWarning = validatePH(pH);
            if (rangeWarning) {
                errorMsg.textContent = rangeWarning;
                errorMsg.classList.remove('hidden');
            }

            // Mostrar resultado
            phValueSpan.textContent = pH.toFixed(2);
            
            // Color
            const colorClass = getColorClass(pH);
            resultBox.classList.add(colorClass);

            // Hacer visible la sección
            resultSection.classList.remove('hidden');

        } catch (e) {
            alert("Error: " + e.message);
        }
    });
});
