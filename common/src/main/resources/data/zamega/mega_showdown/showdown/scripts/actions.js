{
  runMegaEvo(pokemon) {
    const speciesid = pokemon.canMegaEvo || pokemon.canUltraBurst;
    if (!speciesid) return false;

    if (pokemon.ability === 'aurabreak') {
      this.battle.add('-hint', 'Zygarde cannot Mega Evolve while it has Aura Break!');
      return false;
    }

    const isZygardeMega = speciesid === "Zygarde-MegaC";

    if (isZygardeMega) {
      const i = pokemon.moveSlots.findIndex(m => m.id === "coreenforcer");
      if (i >= 0) {
        const nihil = this.battle.dex.moves.get("nihillight");
        for (const slots of [pokemon.moveSlots, pokemon.baseMoveSlots]) {
          Object.assign(slots[i], {
            id: nihil.id,
            move: nihil.name,
            pp: nihil.pp,
            maxpp: nihil.pp,
            used: false,
          });
        }
      }
    }
    pokemon.formeChange(speciesid, pokemon.getItem(), true);
    const wasMega = pokemon.canMegaEvo;
    for (const ally of pokemon.side.pokemon) {
      if (wasMega) ally.canMegaEvo = null;
      else ally.canUltraBurst = null;
    }
    this.battle.runEvent("AfterMega", pokemon);
    return true;
  },

  canMegaEvo(pokemon) {
    const species = pokemon.species;
    if (pokemon.ability === 'aurabreak' && pokemon.terastallized) return null;
    const item = pokemon.getItem();
    if (item.id === "meowsticite") {
      if (species.name === "Meowstic-F") {
        return "Meowstic-F-Mega";
      }
      if (species.name === "Meowstic") {
        return "Meowstic-Mega";
      }
    }
    if (
      species.baseSpecies === "Rayquaza" &&
      (pokemon.terastallized || item.zMove)
    ) {
      return null;
    }
    if (
      species.baseSpecies === "Rayquaza" &&
      pokemon.baseMoves.includes("dragonascent")
    ) {
      return "Rayquaza-Mega";
    }
    const megaKey = species.otherFormes?.find(form =>
      /.*-Mega(-[a-zA-Z])?/.test(form)
    );
    const megaForme = megaKey && this.dex.species.get(megaKey);
    if (
      (this.battle.gen <= 7 || this.battle.ruleTable.has("+pokemontag:past")) &&
      megaForme?.requiredMove &&
      pokemon.baseMoves.includes(megaForme.requiredMove.toLowerCase()) &&
      !item.zMove
    ) {
      return megaForme.name;
    }
    if (
      item.megaEvolves?.includes(species.name) &&
      item.megaStone !== species.name
    ) {
      return item.megaStone;
    }
    return null;
  }
}
