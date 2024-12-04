class Virus {
    constructor(
        virulence,      // Qué tan probable es que se transmita por día (0 - 1)
        incubation,     // Cuánto tiempo (días) pasa entre ser infeccioso y tener síntomas
        infection,      // Cuánto tiempo (días) pasa entre ser sintomático y morir o curarse
        lethality,      // Qué tan probable es que mueras por la infección (0 - 1)
        vaccination,    // Qué proporción de la población está vacunada (0 - 1)
        quarantine,     // Si existe una cuarentena efectiva para las personas infectadas
        distancing      // Si estamos practicando el distanciamiento social para este virus
    ) {
        this.virulence = virulence;
        this.incubation = incubation;
        this.infection = infection;
        this.lethality = lethality;
        this.vaccination = vaccination;
        this.quarantine = quarantine;
        this.distancing = distancing
    }

    // Un valor verdadero/falso para indicar si seremos infecciosos en esta ronda
    randomIsInfected () {

        // Si estamos practicando el distanciamiento, decimos que la virulencia 
        // disminuye 10 veces ya que estamos teniendo contacto con muchas menos personas
        if (this.distancing) {
            return(Math.random() <= (this.virulence / 10));
        }

        return(Math.random() <= this.virulence);
    }

    // Un valor verdadero/falso para indicar si una infección será letal
    //
    // Necesitamos la proporción de uso de camas vs disponibilidad. Multiplicamos la letalidad
    // por esta proporción si es > 1 para considerar a las personas que no reciben el tratamiento que necesitan
    randomIsLethal (bedUseRatio) {

        if (bedUseRatio > 1) {
            return(Math.random() <= (this.lethality * bedUseRatio));
        }
        else {
            return(Math.random() <= this.lethality);
        }

    }

    // Un valor verdadero/falso para indicar si un individuo comienza vacunado
    randomIsVaccinated () {
        return(Math.random() <= this.vaccination);
    }
}


class Person {
    constructor (
        jqueryObj,      // La referencia de consulta al 'td' que representa a esta persona
        row,            // La posición de la fila
        col             // La posición de la columna
    ) {
        this.jqueryObj = jqueryObj;
        this.row = row;
        this.col = col;
        this.infectedAt = null;     // El día en que fueron infectados
        this.immune = false;        // Si son inmunes (ya sea vacunados o curados)
        this.vaccinated = false;    // Si han sido vacunados
        this.dead = false;          // Si murieron a causa de una infección
        this.lastChecked = 0;       // El día en que intentamos infectarnos por última vez para no contar doble
        this.lastMoved = 0;         // El día en que se movieron por última vez
    }

    reset() {
        this.infectedAt = null;
        this.dead = false;
        this.vaccinated = virus.randomIsVaccinated();
        this.immune = this.vaccinated;
        this.lastChecked = 0;
        this.lastMoved = 0;
    }

    can_infect () {
        if (this.dead || this.immune || this.infectedAt == null) {
            return false;
        }

        // No son infecciosos si solo se infectaron en esta ronda
        if (this.infectedAt == day) return false;

        // No infectarán si estamos en cuarentena y son visiblemente infecciosos
        if (virus.quarantine && parseInt(this.infectedAt) + parseInt(virus.incubation) < day) {
            return false;
        }

        return true;
    }

    can_move () {

        // Las personas fallecidas no se mueven
        if (this.dead) {
            return false;
        }

        if (this.lastMoved == day) return false;

        // Las personas sanas siempre pueden moverse
        if (this.vaccinated || this.immune || this.infectedAt == null) {
            return true;
        }

        // No permitimos que las personas en cuarentena se muevan
        if (virus.quarantine && parseInt(this.infectedAt) + parseInt(virus.incubation) < day) {
            return false;
        }

        // Si estamos aplicando distanciamiento, las personas no se mueven
        if (virus.distancing) {
            return false;
        }

        return true;
    }

}
