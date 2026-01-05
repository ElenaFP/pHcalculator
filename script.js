// Constantes de sustancias
const ACIDS = ["HCl", "HBr", "HI", "HNO\u2083", "HClO\u2083", "HClO\u2084"];
const BASES = ["LiOH", "NaOH", "KOH", "RbOH", "CsOH"];
const NEUTRALS = ["H\u2082O (no molarity)", "NaCl", "KCl", "No substance"];

// Clase Substance
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
    let protons = 1e-7;
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
    let hydroxils = 1e-7;
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
    if (totalProtons > 0) {
        pH = -Math.log10(totalProtons);
    } else if (totalProtons < 0) {
        const totalHydroxils = -totalProtons;
        pH = 14 + Math.log10(totalHydroxils);
    } else {
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

    // Lógica para desactivar Molaridad si es Agua
    const molarity1Input = document.getElementById('molarity1');
    const molarity2Input = document.getElementById('molarity2');
    const waterString = NEUTRALS[0]; // "H₂O (no molarity)"

    function toggleMolarity(select, input) {
        if (select.value === waterString) {
            input.disabled = true;
            input.value = ""; // Limpiar visualmente
            input.placeholder = "---";
        } else {
            input.disabled = false;
            input.placeholder = "Ej: 0.1";
        }
    }

    select1.addEventListener('change', () => toggleMolarity(select1, molarity1Input));
    select2.addEventListener('change', () => toggleMolarity(select2, molarity2Input));

    // Selección inicial
    select1.value = ACIDS[0]; // HCl
    select2.value = NEUTRALS[3]; // No substance
    // Asegurar estado inicial correcto
    toggleMolarity(select1, molarity1Input);
    toggleMolarity(select2, molarity2Input);

    // 2. Manejar el click del botón
    const btn = document.getElementById('calculate-btn');
    const resultBox = document.getElementById('result-box');
    const phValueSpan = document.getElementById('ph-value');
    const errorMsg = document.getElementById('error-message');

    btn.addEventListener('click', () => {
        // Reset visual
        errorMsg.classList.add('invisible'); 
        errorMsg.textContent = "";
        resultBox.className = ""; 

        // Obtener valores
        const f1 = select1.value;
        // Si es agua, forzamos molaridad 0 para evitar errores de NaN
        const m1 = (f1 === waterString) ? 0 : parseFloat(molarity1Input.value);
        const v1 = parseFloat(document.getElementById('volume1').value);

        const f2 = select2.value;
        // Si es agua o vacío, molaridad 0
        const m2 = (f2 === waterString || !molarity2Input.value) ? 0 : parseFloat(molarity2Input.value);
        const v2 = document.getElementById('volume2').value ? parseFloat(document.getElementById('volume2').value) : 0;

        // Validación básica
        // Solo validamos m1 si NO es agua. v1 siempre se valida.
        if ((f1 !== waterString && isNaN(m1)) || isNaN(v1)) {
            alert("Por favor, introduce valores numéricos válidos para la Sustancia 1.");
            return;
        }

        try {
            const s1 = new Substance(f1, m1, v1);
            const s2 = new Substance(f2, m2, v2);

            const totalVol = getTotalVolume(s1, s2);
            const protons = getProtonsConcentration(s1, s2, totalVol);
            const hydroxils = getHydroxilsConcentration(s1, s2, totalVol);
            const pH = getPH(protons, hydroxils);

            // Validaciones de rango
            const rangeWarning = validatePH(pH);
            if (rangeWarning) {
                errorMsg.textContent = rangeWarning;
                errorMsg.classList.remove('invisible'); // Mostrar mensaje
            }

            // Mostrar resultado
            phValueSpan.textContent = pH.toFixed(2);
            
            // Color
            const colorClass = getColorClass(pH);
            resultBox.classList.add(colorClass);

            // Ya no hace falta mostrar result-section porque siempre es visible

        } catch (e) {
            alert("Error: " + e.message);
        }
    });
});