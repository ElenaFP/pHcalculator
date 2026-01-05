// Constantes de sustancias
const ACIDS = ["HCl", "HBr", "HI", "HNO\u2083", "HClO\u2083", "HClO\u2084"];
const BASES = ["LiOH", "NaOH", "KOH", "RbOH", "CsOH"];
const NEUTRALS = ["H\u2082O", "NaCl", "KCl", "Ninguna"];

// Clase Substance
class Substance {
    constructor(formula, molarity, volume) {
        if ((molarity < 0 || volume < 0) && formula !== "Ninguna") {
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
        return "neutral"; 
    }

    get_molarity() { return this._molarity; }
    get_volume() { return this._volume; }
    is_acid() { return this._acidity === "acid"; }
    is_base() { return this._acidity === "base"; }
}

// Lógica de cálculo
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

function getStatusMessage(pH, substance1, substance2) {
    if (pH > 14) return { text: "Concentración de base inusualmente alta.", type: "error" };
    if (pH < 0) return { text: "Concentración de ácido inusualmente alta.", type: "error" };
    
    if (Math.abs(pH - 7.0) < 0.01) return { text: "Disolución neutra", type: "info" };

    const isNeutralization = (substance1.is_acid() && substance2.is_base()) || 
                             (substance1.is_base() && substance2.is_acid());

    if (pH < 7) return { text: isNeutralization ? "Exceso de ácido" : "Disolución ácida", type: "info" };
    return { text: isNeutralization ? "Exceso de base" : "Disolución básica", type: "info" };
}

function getColorClass(pH) {
    const phVal = parseFloat(pH.toFixed(2));
    if (phVal < 7.00) return "result-acid";
    if (phVal > 7.00) return "result-base";
    return "result-neutral";
}

// --- Lógica de UI ---

const ANIONS = { "HCl": "Cl", "HBr": "Br", "HI": "I", "HNO\u2083": "NO3", "HClO\u2083": "ClO3", "HClO\u2084": "ClO4" };
const CATIONS = { "LiOH": "Li", "NaOH": "Na", "KOH": "K", "RbOH": "Rb", "CsOH": "Cs" };

function formatFormulaHTML(formula) {
    return formula.replace(/(\d+)/g, "<sub>$1</sub>")
                  .replace(/\u2082/g, "<sub>2</sub>")
                  .replace(/\u2083/g, "<sub>3</sub>")
                  .replace(/\u2084/g, "<sub>4</sub>");
}

function getReactionHTML(substance1, substance2) {
    let acid = null; let base = null;
    if (substance1.is_acid()) acid = substance1;
    if (substance2.is_acid()) acid = substance2;
    if (substance1.is_base()) base = substance1;
    if (substance2.is_base()) base = substance2;

    if (acid && base) {
        const anion = ANIONS[acid._formula];
        const cation = CATIONS[base._formula];
        if (anion && cation) {
            return `${formatFormulaHTML(acid._formula)} + ${formatFormulaHTML(base._formula)} <span class="arrow">&rarr;</span> ${formatFormulaHTML(cation + anion)} + H<sub>2</sub>O`;
        }
    }
    const s1Present = substance1._formula !== "Ninguna" && substance1.get_volume() > 0;
    const s2Present = substance2._formula !== "Ninguna" && substance2.get_volume() > 0;
    return (s1Present && s2Present) ? `<span class="no-reaction">Mezcla sin reacción química</span>` : `<span class="no-reaction">Sin reacción química</span>`;
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Rellenar dropdowns
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
            if (opt.disabled) { option.disabled = true; option.textContent = opt.label; }
            else { option.value = opt.value; option.textContent = opt.label; }
            selectElement.appendChild(option);
        });
    }

    populateSelect(select1);
    populateSelect(select2);

    const molarity1Input = document.getElementById('molarity1');
    const molarity2Input = document.getElementById('molarity2');
    const volume1Input = document.getElementById('volume1');
    const volume2Input = document.getElementById('volume2');
    const card2 = select2.closest('.card');
    const btn = document.getElementById('calculate-btn'); // Subido aquí
    
    const waterString = NEUTRALS[0];
    const noneString = NEUTRALS[3];

    function updateInputState(select, molInput, volInput) {
        const val = select.value;
        if (molInput.classList.contains('global-disabled')) return;

        if (val === noneString) {
            molInput.disabled = true; molInput.value = ""; molInput.placeholder = "---";
            volInput.disabled = true; volInput.value = ""; volInput.placeholder = "---";
        } else if (val === waterString) {
            molInput.disabled = true; molInput.value = ""; molInput.placeholder = "---";
            volInput.disabled = false; volInput.placeholder = "Ej: 50";
        } else {
            molInput.disabled = false; molInput.placeholder = "Ej: 0.1";
            volInput.disabled = false; volInput.placeholder = "Ej: 50";
        }
    }

    function checkSolution1Validity() {
        const f1 = select1.value;
        const m1 = parseFloat(molarity1Input.value);
        const v1 = parseFloat(volume1Input.value);
        let isValid = false;

        if (f1 === noneString) isValid = false;
        else if (f1 === waterString) isValid = !isNaN(v1) && v1 > 0;
        else isValid = !isNaN(m1) && m1 > 0 && !isNaN(v1) && v1 > 0;

        // Desbloqueo de Disolución 2
        const d2Inputs = [select2, molarity2Input, volume2Input];
        if (isValid) {
            card2.style.opacity = "1"; card2.style.pointerEvents = "auto";
            d2Inputs.forEach(el => { el.disabled = false; el.classList.remove('global-disabled'); });
            updateInputState(select2, molarity2Input, volume2Input); 
        } else {
            card2.style.opacity = "0.6"; card2.style.pointerEvents = "none";
            d2Inputs.forEach(el => { el.disabled = true; el.classList.add('global-disabled'); });
        }

        // BLOQUEO DEL BOTÓN CALCULAR (Nuevo)
        btn.disabled = !isValid;
    }

    select1.addEventListener('change', () => { updateInputState(select1, molarity1Input, volume1Input); checkSolution1Validity(); });
    molarity1Input.addEventListener('input', checkSolution1Validity);
    volume1Input.addEventListener('input', checkSolution1Validity);
    select2.addEventListener('change', () => updateInputState(select2, molarity2Input, volume2Input));

    // Inicialización
    select1.value = ACIDS[0]; select2.value = noneString; 
    updateInputState(select1, molarity1Input, volume1Input);
    updateInputState(select2, molarity2Input, volume2Input);
    checkSolution1Validity(); 

    const resultBox = document.getElementById('result-box');
    const phValueSpan = document.getElementById('ph-value');
    const errorMsg = document.getElementById('error-message');
    const reactionContainer = document.getElementById('reaction-container');
    const reactionEquation = document.getElementById('reaction-equation');

    btn.addEventListener('click', () => {
        errorMsg.className = 'invisible'; errorMsg.textContent = "";
        resultBox.className = ""; reactionContainer.classList.add('hidden'); 

        const f1 = select1.value;
        const m1 = (f1 === waterString || f1 === noneString) ? 0 : parseFloat(molarity1Input.value);
        const v1 = (f1 === noneString) ? 0 : parseFloat(volume1Input.value);
        const f2 = select2.value;
        const m2 = (f2 === waterString || f2 === noneString || !molarity2Input.value) ? 0 : parseFloat(molarity2Input.value);
        const v2 = (f2 === noneString || !volume2Input.value) ? 0 : parseFloat(volume2Input.value);

        try {
            const s1 = new Substance(f1, m1, v1);
            const s2 = new Substance(f2, m2, v2);
            const totalVol = getTotalVolume(s1, s2);
            const protons = getProtonsConcentration(s1, s2, totalVol);
            const hydroxils = getHydroxilsConcentration(s1, s2, totalVol); // FIX: totalVolume -> totalVol
            const pH = getPH(protons, hydroxils);

            const status = getStatusMessage(pH, s1, s2);
            errorMsg.textContent = status.text; errorMsg.className = status.type; errorMsg.classList.remove('invisible');

            reactionEquation.innerHTML = getReactionHTML(s1, s2);
            reactionContainer.classList.remove('hidden');
            phValueSpan.textContent = pH.toFixed(2);
            resultBox.classList.add(getColorClass(pH));
        } catch (e) { alert("Error: " + e.message); }
    });
});
