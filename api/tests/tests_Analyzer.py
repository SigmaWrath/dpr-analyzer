import unittest

from dpr_core.Analyzer import Analyzer
from dpr_core.Attack import Attack


class MyTestCase(unittest.TestCase):

    def test_avgs_1(self):
        Kalki = Analyzer("Kalki Level 5")
        scimitar_quarry = Attack("Scimitar w/ Ranger's Quarry",
                                 damagef="1d6+4+1d4", toHitf="1d20+3+4")
        Kalki.add(scimitar_quarry, 2)

        Kalki.get_avg(10)

    def test_graph_cross_section_1(self):
        Kalki = Analyzer("Kalki Level 5")
        scimitar_quarry = Attack("Scimitar w/ Ranger's Quarry",
                                 damagef="1d6+4+1d4", toHitf="1d20+3+4")
        Kalki.add(scimitar_quarry, 2)

        Kalki.graph_cross_section(15)

    def test_analyze_1(self):
        Kalki = Analyzer("Kalki Level 5")
        scimitar_quarry = Attack("Scimitar w/ Ranger's Quarry",
                                 damagef="1d6+4+1d4", toHitf="1d20+3+4")
        Kalki.add(scimitar_quarry, 2)
        Kalki.analyze(10, 25)

    def test_analyze_2(self):
        longbow1 = Attack(name="Sharpshoot Longbow w/ Guided Strike",
                          damagef="1d8+7+1d6+10", toHitf="1d20+17")
        longbow2 = Attack(name="Sharpshoot Longbow",
                          damagef="1d8+7+1d6+10", toHitf="1d20+7")
        frighten = Attack(name="Dread Ambusher: Frighten", damagef="1d8", toHitf="", isAC=False)

        Kalki = Analyzer("Longbow w/ action surge arrows")
        Kalki.add(longbow1, 1)
        Kalki.add(longbow2, 3)
        Kalki.add(frighten, 1)

        Kalki.analyze(10, 25)

    def test_analyze_3(self):
        longbow1 = Attack(name="Sharpshoot Longbow w/ Guided Strike",
                          damagef="1d8+7+1d6+10", toHitf="1d20+17")
        longbow2 = Attack(name="Sharpshoot Longbow",
                          damagef="1d8+7+1d6+10", toHitf="1d20+7")
        frighten = Attack(name="Dread Ambusher: Frighten", damagef="1d8", toHitf="", isAC=False)

        Kalki = Analyzer("Longbow w/ action surge arrows")
        Kalki.add(longbow1, 1)
        Kalki.add(longbow2, 3)
        Kalki.add(frighten, 1)

        Kalki.analyze(10, 25, graphs='3d', testAC=20)

if __name__ == '__main__':
    unittest.main()
