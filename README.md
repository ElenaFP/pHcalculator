# pH Mix Master Web

Una calculadora web interactiva y didáctica para determinar el pH de disoluciones de ácidos fuertes, bases fuertes y sus mezclas. Diseñada específicamente para alumnos de química, esta herramienta permite simular valoraciones y visualizar las reacciones químicas resultantes.

🔗 **[Acceder a la aplicación](https://ElenaFP.github.io/pHcalculator/)**

## Características Principales

*   **Cálculo de pH de alta precisión:** Calcula el pH basándose en la concentración neta de protones e hidróxilos, considerando el aporte del agua pura ($10^{-7}$ M).
*   **Simulación de Reacciones:** La aplicación identifica automáticamente si existe una reacción de neutralización y muestra la ecuación química ajustada (ej: $HCl + NaOH \rightarrow NaCl + H_2O$).
*   **Feedback Contextual:** El sistema distingue el tipo de mezcla para ofrecer mensajes precisos:
    *   En reacciones de neutralización indica si hay **"Exceso de ácido/base"**.
    *   En disoluciones simples indica el carácter **"Ácido/Básico"** de la mezcla.
*   **Interfaz Inteligente:** La Disolución 2 permanece bloqueada hasta que la primera es válida, y los campos se desactivan automáticamente según la sustancia (Agua/Ninguna).
*   **Diseño Adaptable:** Optimizado para móviles, tablets y portátiles.
*   **Indicador Visual:** El resultado se muestra en un círculo de color (Rojo/Verde/Azul) simulando el viraje del papel tornasol.

## Sustancias Incluidas

*   **Ácidos Fuertes (monopróticos):** $HCl, HBr, HI, HNO_3, HClO_3, HClO_4$.
*   **Bases Fuertes (alcalinas):** $LiOH, NaOH, KOH, RbOH, CsOH$.
*   **Neutros:** Agua destilada ($H_2O$), sales neutras ($NaCl, KCl$).

## Instrucciones de Uso

1.  **Configura la Disolución 1:** Selecciona la sustancia e introduce la molaridad (mol/L) y el volumen (mL).
2.  **Configura la Disolución 2 (Opcional):** Una vez válida la primera, se activará la segunda.
3.  **Calcula:** El botón "Calcular pH" se activará automáticamente cuando los datos de la Disolución 1 sean coherentes. Pulsa para obtener el resultado.
4.  **Analiza:** Revisa la ecuación química y el valor del pH. La aplicación avisará si las concentraciones son inusualmente altas.

---
*Versión Web mejorada y ampliada basada en el proyecto original en Python "pH Mix Master".*