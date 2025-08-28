import unittest

from dpr_core.Analyzer import Analyzer
from dpr_core.Attack import Attack


class MyTestCase(unittest.TestCase):
    def test_Alchemist(self):
        Alchemist = Analyzer("Alchemist Lvl 20 Nova Turn")
        scimitar_buffed = Attack("Scimitar w/ Colossus, Boldness",
                                 damagef="1d6+5+1d4", toHitf="1d20+6+5+1d4")
        scimitar_explosive = Attack("Action Surge Scimitar w/ Colossus, Boldness",
                                    damagef="1d6+5+1d4+2d8", toHitf="1d20+6+5+1d4")
        Alchemist.add(scimitar_buffed, 5)
        Alchemist.add(scimitar_explosive, 5)
        Alchemist.analyze(10, 25, graphs=True, testAC=20)

    def test_Iskah(self):
        scimitar_cme_ds_bcs = Attack("Scimitar w/ CME, 4+DS", damagef="1d6+6d8+5d8+5", toHitf="30")
        scimitar_cme_ds = Attack("Scimitar w/ CME, 4+DS", damagef="1d6+6d8+5d8+5", toHitf="1d20+5+6+2d4")
        eb_cme = Attack("Eldritch Blast w/ CME", damagef="1d10+6d8+5", toHitf="1d20+5+6")
        eb_cme_fbg = Attack("Eldritch Blast w/ CME & Favored by Gods", damagef="1d10+6d8+5", toHitf="1d20+5+6+2d4")
        scimitar_cme = Attack("Scimitar w/ CME", damagef="1d6+6d8+5", toHitf="1d20+5+6")

        Iskah_Doshai = Analyzer("Iskah Doshai Level 20 Nova Round")
        Iskah_Doshai.add(eb_cme, 5)
        Iskah_Doshai.add(eb_cme_fbg, 3)
        Iskah_Doshai.add(scimitar_cme_ds_bcs, 1)
        Iskah_Doshai.add(scimitar_cme_ds, 1)
        Iskah_Doshai.add(scimitar_cme, 1)

        Iskah_Doshai.analyze(10, 25)

    def test_Adora_8_prep_love(self):
        Adora = Analyzer("Adora Lvl 8") # Devotion Paladin 5/Zealot Barbarian 3
        attack_1 = Attack("Greatsword GWF+GWM, Fire's Burn, Divine Favor, Galvanized, Rage, Zealot, Divine Smite 2, Reckless Attack",
                          damagef="2d6+4+1+3+1d10+1d4+2+2+1d6+1+3d8", toHitf="Ad20+3+4")
        attack_2 = Attack("Greatsword GWF+GWM, Fire's Burn, Divine Favor, Galvanized, Rage, Divine Smite 2, Reckless Attack",
                          damagef="2d6+4+1+3+1d10+1d4+2+2+3d8", toHitf="Ad20+3+4")
        steed_attack = Attack("Otherworldly Slam", damagef="1d8+2", toHitf="1d20+3+3")

        Adora.add(attack_1, 1)
        Adora.add(attack_2, 1)
        Adora.add(steed_attack, 1)
        Adora.analyze(10, 25)

    def test_Adora_8_spont_love(self):
        Adora = Analyzer("Adora Lvl 8")
        attack_1 = Attack("Greatsword GWF+GWM, Fire's Burn, Rage, Zealot, Divine Smite 2, Reckless Attack",
                          damagef="2d6+4+1+3+1d10+2+1d6+1+3d8", toHitf="Ad20+3+4")
        attack_2 = Attack("Greatsword GWF+GWM, Fire's Burn, Rage, Divine Smite 2, Reckless Attack",
                          damagef="2d6+4+1+3+1d10+2+3d8", toHitf="Ad20+3+4")
        steed_attack = Attack("Otherworldly Slam", damagef="1d8+2", toHitf="1d20+3+3")

        Adora.add(attack_1, 1)
        Adora.add(attack_2, 1)
        Adora.add(steed_attack, 1)
        Adora.analyze(10, 25, graphs='cs', testAC=16)

    def test_Adora_8_prep_devotion(self):
        Adora = Analyzer("Adora Lvl 8") # Devotion Paladin 5/Zealot Barbarian 3
        attack_1 = Attack("Greatsword GWF+GWM, Fire's Burn, Divine Favor, Rage, Zealot, Divine Smite 2, Reckless Attack, Sacred Weapon",
                          damagef="2d6+1+4+3+1d10+1d4+2+1d6+1+3d8", toHitf="Ad20+3+4+3")
        attack_2 = Attack("Greatsword GWF+GWM, Fire's Burn, Divine Favor, Rage, Divine Smite 2, Reckless Attack, Sacred Weapon",
                          damagef="2d6+1+4+3+1d10+1d4+2+3d8", toHitf="Ad20+3+4+3")
        steed_attack = Attack("Otherworldly Slam", damagef="1d8+2", toHitf="1d20+3+3")

        Adora.add(attack_1, 1)
        Adora.add(attack_2, 1)
        Adora.add(steed_attack, 1)
        Adora.analyze(10, 25)

    def test_Adora_20_prep_love(self):
        Adora = Analyzer("Adora Lvl 20") # Love Paladin 12/Zealot Barbarian 4/Lore Bard 4
        attack_1 = Attack("Greatsword GWF+GWM, Fire's Burn, Divine Favor, Galvanized, Rage, Zealot, Divine Smite 4, Radiant Strikes, Charger, Boon of Combat Prowess",
                          damagef="2d6+6+1+6+1d10+1d4+2+2+1d6+2+5d8+1d8+1d8", toHitf="30")
        attack_2 = Attack("Greatsword GWF+GWM, Fire's Burn, Divine Favor, Galvanized, Rage, Divine Smite 4, Radiant Strikes, Reckless Attack",
                          damagef="2d6+6+1+6+1d10+1d4+2+2+5d8+1d8", toHitf="Ad20+6+6")
        steed_attack = Attack("Otherworldly Slam w/ Aura of Love Reaction", damagef="1d8+4", toHitf="1d20+3+6+3")

        Adora.add(attack_1, 1)
        Adora.add(attack_2, 1)
        Adora.add(steed_attack, 1)
        Adora.analyze(10, 25, graphs='cs', testAC=20)

    def test_Adora_20_prep_love_fighter(self):
        Adora = Analyzer("Adora Lvl 20") # Love Paladin 12/Zealot Barbarian 4/Fighter 2/Bard 2
        attack_1 = Attack("Greatsword GWF+GWM, Fire's Burn, Divine Favor, Galvanized, Rage, Zealot, Divine Smite 4, Radiant Strikes, Boon of Combat Prowess",
                          damagef="2d6+6+1+6+1d10+1d4+2+2+1d6+2+5d8+1d8", toHitf="30")
        attack_2 = Attack("Greatsword GWF+GWM, Fire's Burn, Divine Favor, Galvanized, Rage, Divine Smite 4, Radiant Strikes, Reckless Attack",
                          damagef="2d6+6+1+6+1d10+1d4+2+2+5d8+1d8", toHitf="Ad20+6+6")
        attack_3 = Attack("Greatsword GWF+GWM, Fire's Burn, Divine Favor, Galvanized, Rage, Divine Smite 3, Radiant Strikes, Reckless Attack",
                          damagef="2d6+6+1+6+1d10+1d4+2+2+4d8+1d8", toHitf="Ad20+6+6")
        steed_attack = Attack("Otherworldly Slam", damagef="1d8+3", toHitf="1d20+3+6")

        Adora.add(attack_1, 1)
        Adora.add(attack_2, 1)
        Adora.add(attack_3, 2)
        Adora.add(steed_attack, 1)
        Adora.analyze(10, 25, graphs='cs', testAC=20)

    def test_Adora_20_prep_devotion_fighter(self):
        Adora = Analyzer("Adora Lvl 20") # Devotion Paladin 12/Zealot Barbarian 4/Fighter 2/Bard 2
        attack_1 = Attack("Greatsword GWF+GWM, Fire's Burn, Divine Favor, Rage, Zealot, Divine Smite 4, Radiant Strikes, Boon of Combat Prowess",
                          damagef="2d6+6+1+6+1d10+1d4+2+1d6+2+5d8+1d8", toHitf="30")
        attack_2 = Attack("Greatsword GWF+GWM, Fire's Burn, Divine Favor, Rage, Divine Smite 4, Radiant Strikes, Reckless Attack, Sacred Weapon",
                          damagef="2d6+6+1+6+1d10+1d4+2+5d8+1d8", toHitf="Ad20+6+6+3")
        attack_3 = Attack("Greatsword GWF+GWM, Fire's Burn, Divine Favor, Rage, Divine Smite 3, Radiant Strikes, Reckless Attack, Sacred Weapon",
                          damagef="2d6+6+1+6+1d10+1d4+2+4d8+1d8", toHitf="Ad20+6+6+3")
        steed_attack = Attack("Otherworldly Slam", damagef="1d8+3", toHitf="1d20+3+6")

        Adora.add(attack_1, 1)
        Adora.add(attack_2, 1)
        Adora.add(attack_3, 2)
        Adora.add(steed_attack, 1)
        Adora.analyze(10, 25, graphs='cs, 3d', testAC=20)

    def test_Adora_20_prep_devotion_swords(self):
        Adora = Analyzer("Adora Lvl 20") # Devotion Paladin 12/Zealot Barbarian 4/Swords Bard 4 —— [see 'Playable' in Notes app]
        attack_1 = Attack("Greatsword GWF+GWM, Fire's Burn, Divine Favor, Rage, Zealot, Flourish, Divine Smite 4, Radiant Strikes, Boon of Combat Prowess",
                          damagef="2d6+6+1+6+1d10+1d4+2+1d6+2+1d6+5d8+1d8", toHitf="30")
        attack_2 = Attack("Greatsword GWF+GWM, Fire's Burn, Divine Favor, Rage, Divine Smite 4, Radiant Strikes, Reckless Attack, Sacred Weapon",
                          damagef="2d6+6+1+6+1d10+1d4+2+5d8+1d8", toHitf="Ad20+6+6+4")
        steed_attack = Attack("Otherworldly Slam", damagef="1d8+4", toHitf="1d20+4+6")

        Adora.add(attack_1, 1)
        Adora.add(attack_2, 1)
        Adora.add(steed_attack, 1)
        Adora.analyze(10, 25, graphs=False, testAC=20)

if __name__ == '__main__':
    unittest.main()
