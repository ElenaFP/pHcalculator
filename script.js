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

// Mapeo de iones para formular sales
// Clave: Fórmula completa (con unicode), Valor: Parte iónica (string simple para formatear después)
const ANIONS = {
    "HCl": "Cl",
    "HBr": "Br",
    "HI": "I",
    "HNO\u2083": "NO3",
    "HClO\u2083": "ClO3",
    "HClO\u2084": "ClO4"
};

const CATIONS = {
    "LiOH": "Li",
    "NaOH": "Na",
    "KOH": "K",
    "RbOH": "Rb",
    "CsOH": "Cs"
};

function formatFormulaHTML(formula) {
    // Convierte números en la fórmula a etiquetas <sub>
    // También maneja los unicodes si vienen
    return formula.replace(/(\d+)/g, "<sub>$1</sub>")
                  .replace(/\u2082/g, "<sub>2</sub>")
                  .replace(/\u2083/g, "<sub>3</sub>")
                  .replace(/\u2084/g, "<sub>4</sub>");
}

function getReactionHTML(substance1, substance2) {
    let acid = null;
    let base = null;

    if (substance1.is_acid()) acid = substance1;
    if (substance2.is_acid()) acid = substance2;
    
    if (substance1.is_base()) base = substance1;
    if (substance2.is_base()) base = substance2;

    // Caso 1: Neutralización (Ácido + Base)
    if (acid && base) {
        const anion = ANIONS[acid._formula];
        const cation = CATIONS[base._formula];
        
        if (anion && cation) {
            const salt = cation + anion;
            return `${formatFormulaHTML(acid._formula)} + ${formatFormulaHTML(base._formula)} 
                    <span class="arrow">&rarr;</span> 
                    ${formatFormulaHTML(salt)} + H<sub>2</sub>O`;
        }
    }

    // Caso 2: Determinar si es una mezcla o sustancia única
    const s1Present = substance1._formula !== "No substance" && substance1.get_volume() > 0;
    const s2Present = substance2._formula !== "No substance" && substance2.get_volume() > 0;

    if (s1Present && s2Present) {
        return `<span class="no-reaction">Mezcla sin reacción química</span>`;
    } else {
        return `<span class="no-reaction">Sin reacción química</span>`;
    }
}

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
    const volume1Input = document.getElementById('volume1'); // Nuevo selector
    const volume2Input = document.getElementById('volume2'); // Nuevo selector
    
    // Selectores para el bloqueo visual
    // select2 ya está declarado arriba
    const card2 = select2.closest('.card'); // Seleccionamos la tarjeta entera
    
    const waterString = NEUTRALS[0]; // "H₂O (no molarity)"

    function toggleMolarity(select, input) {
        if (select.value === waterString) {
            input.disabled = true;
            input.value = ""; 
            input.placeholder = "---";
        } else {
            // Solo reactivamos si la tarjeta NO está bloqueada globalmente
            if (!input.classList.contains('global-disabled')) {
                input.disabled = false;
                input.placeholder = "Ej: 0.1";
            }
        }
    }

    // Función para comprobar si la Disolución 1 es válida y activar la 2
    function checkSolution1Validity() {
        const f1 = select1.value;
        const m1 = parseFloat(molarity1Input.value);
        const v1 = parseFloat(volume1Input.value);
        
        let isValid = false;

        if (f1 === waterString) {
            // Si es agua, solo necesitamos volumen
            isValid = !isNaN(v1) && v1 > 0;
        } else {
            // Si es otro, necesitamos molaridad y volumen
            isValid = !isNaN(m1) && m1 > 0 && !isNaN(v1) && v1 > 0;
        }

        // Elementos a bloquear/desbloquear en D2
        const d2Inputs = [select2, molarity2Input, volume2Input];

        if (isValid) {
            // ACTIVAR D2
            card2.style.opacity = "1";
            card2.style.pointerEvents = "auto";
            
            d2Inputs.forEach(el => {
                el.disabled = false;
                el.classList.remove('global-disabled');
            });
            
            // Re-aplicar lógica específica de agua para D2 (por si D2 es agua)
            toggleMolarity(select2, molarity2Input); 
        } else {
            // DESACTIVAR D2
            card2.style.opacity = "0.6"; // Efecto visual "apagado"
            card2.style.pointerEvents = "none"; // Evita clicks
            
            d2Inputs.forEach(el => {
                el.disabled = true;
                el.classList.add('global-disabled'); // Marca para no reactivar accidentalmente
            });
        }
    }

    select1.addEventListener('change', () => {
        toggleMolarity(select1, molarity1Input);
        checkSolution1Validity();
    });
    
    molarity1Input.addEventListener('input', checkSolution1Validity);
    volume1Input.addEventListener('input', checkSolution1Validity);
    
    // Listeners para toggleMolarity en D2 (cuando esté activa)
    select2.addEventListener('change', () => toggleMolarity(select2, molarity2Input));

    // Selección inicial
    select1.value = ACIDS[0]; 
    select2.value = NEUTRALS[3]; 
    
    // Inicializar estados
    toggleMolarity(select1, molarity1Input);
    toggleMolarity(select2, molarity2Input);
    checkSolution1Validity(); // Comprobar estado inicial (bloqueará D2)

    // 2. Manejar el click del botón
    const btn = document.getElementById('calculate-btn');
    const resultBox = document.getElementById('result-box');
    const phValueSpan = document.getElementById('ph-value');
    const errorMsg = document.getElementById('error-message');
    const reactionContainer = document.getElementById('reaction-container');
    const reactionEquation = document.getElementById('reaction-equation');

    btn.addEventListener('click', () => {
        // Reset visual
        errorMsg.classList.add('invisible'); 
        errorMsg.textContent = "";
        resultBox.className = ""; 
        reactionContainer.classList.add('hidden'); // Ocultar reacción previa

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
                errorMsg.classList.remove('invisible'); 
            }

            // Mostrar Ecuación Química
            reactionEquation.innerHTML = getReactionHTML(s1, s2);
            reactionContainer.classList.remove('hidden');

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