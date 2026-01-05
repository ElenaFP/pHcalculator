# pH Mix Master Web

Una calculadora web interactiva y didáctica para determinar el pH de disoluciones de ácidos fuertes, bases fuertes y sus mezclas. Diseñada específicamente para alumnos de química, esta herramienta permite simular valoraciones y visualizar las reacciones químicas resultantes.

🔗 **[Acceder a la aplicación](https://ElenaFP.github.io/pHcalculator/)**

## Características Principales

*   **Cálculo de pH de alta precisión:** Calcula el pH basándose en la concentración neta de protones e hidróxilos, considerando el aporte del agua pura ($10^{-7}$ M).
*   **Simulación de Reacciones:** La aplicación identifica automáticamente si existe una reacción de neutralización y muestra la ecuación química ajustada (ej: $HCl + NaOH \rightarrow NaCl + H_2O$).
*   **Detección de Casos:** Distingue entre disoluciones únicas, mezclas con dilución y reacciones de neutralización.
*   **Interfaz Inteligente:** La Disolución 2 permanece bloqueada hasta que la primera es válida, guiando al usuario en el proceso.
*   **Diseño Adaptable:** Optimizado para móviles, tablets y portátiles, con una columna de resultados compacta y estable.
*   **Indicador Visual:** El resultado se muestra en un círculo de color (Rojo/Verde/Azul) simulando el viraje del papel tornasol.

## Sustancias Incluidas

*   **Ácidos Fuertes (monopróticos):** $HCl, HBr, HI, HNO_3, HClO_3, HClO_4$.
*   **Bases Fuertes (alcalinas):** $LiOH, NaOH, KOH, RbOH, CsOH$.
*   **Neutros:** Agua destilada ($H_2O$), sales neutras ($NaCl, KCl$).

## Instrucciones de Uso

1.  **Configura la Disolución 1:** Selecciona la fórmula e introduce la molaridad (mol/L) y el volumen (mL).
2.  **Configura la Disolución 2 (Opcional):** Una vez válida la primera, se activará la segunda. 
    *   Si seleccionas **H₂O**, la molaridad se bloqueará.
    *   Si seleccionas **Ninguna**, se bloquearán ambos campos (molaridad y volumen).
3.  **Calcula:** Pulsa el botón "Calcular pH".
4.  **Analiza:** Revisa la ecuación química y el valor del pH. La aplicación avisará si las concentraciones son inusualmente altas.

---
*Versión Web mejorada y ampliada basada en el proyecto original en Python "pH Mix Master".*
