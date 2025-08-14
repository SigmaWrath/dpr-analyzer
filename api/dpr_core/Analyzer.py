from .probability_utils import add_dists
import matplotlib.pyplot as plt
import numpy as np


class Analyzer:

    def __init__(self, name):
        self.attacks = {}
        self.name = name
        self.damage_dists_AC = {}
        self.damage_avgs_AC = {}

    # Add an Attack for the Analyzer to consider
    def add(self, attack, times):
        if times>0:
            if attack in self.attacks:
                self.attacks[attack] += times
            else:
                self.attacks[attack] = times

    # Return the max damage of the combined attacks, not accounting for critical hits
    def max_damage(self):
        damage = 0
        for attack in self.attacks.keys():
            damage += attack.damage_formula.max_roll() * self.attacks[attack]
        return damage

    # Return the damage distribution of the combined attacks against a given AC
    def simulate(self, AC):
        # Check if we've already found the distribution
        if AC in self.damage_dists_AC.keys():
            return self.damage_dists_AC[AC]
        else:
            prob_dists = []

            for attack in self.attacks.keys():
                # Step 1: Compute scaled damage distributions for each attack
                attack_dist = attack.damage_dist(AC)
                # Step 2: Flatten out dictionary into an array of these dists
                for _ in range(self.attacks[attack]):
                    prob_dists.append(attack_dist)

            # Step 3: Combine the scaled damage distributions from the array
            result = prob_dists[0]
            for i in range(len(prob_dists)-1):
                result = add_dists(result, prob_dists[i+1])

            # Bonus: Add the damage distribution to the class dictionary of {AC:damage_dist}
            self.damage_dists_AC[AC] = result

        return result

    # Return the average damage of the combined attacks against a given AC
    def get_avg(self, AC):
        # Check if we've already found the distribution
        if AC in self.damage_avgs_AC.keys():
            return self.damage_avgs_AC[AC]
        else:
            avg_damage = 0
            # Go through each attack and add up the average damages
            for attack in self.attacks.keys():
                attack_avg = attack.damage_avg(AC)
                avg_damage += attack_avg*self.attacks[attack]
            self.damage_avgs_AC[AC] = avg_damage

        return avg_damage

    # Graph the damage distribution of the combined attacks against a given AC
    def graph_cross_section(self, AC, color='#1f77b4'):
        probabilities = self.simulate(AC)
        plt.bar(probabilities.keys(), [x * 100 for x in probabilities.values()],
                color=color, edgecolor='black')
        plt.xlabel('Damage')
        plt.ylabel('Percentage (%)')
        plt.title('Damage Distribution at AC ' + str(AC) + ' for \'' + self.name + '\'')
        plt.show()

    # Graph the average damage of the combined attacks against a given range of ACs
    def graph_avg_damage(self, minAC, maxAC, color='#1f77b4'):
        AC_range = range(minAC, maxAC+1)
        damage_dict = {}
        for AC in AC_range:
            damage_dict[AC] = self.get_avg(AC)
        plt.bar(damage_dict.keys(), damage_dict.values(), color=color, edgecolor='black')
        plt.xlabel('AC')
        plt.ylabel('Damage')
        plt.title('Avg Damage per AC for \'' + self.name + '\'')

        plt.show()

    # Return a 3D graph: X/Y/Z -> AC/Damage/Probability
    def graph_3d(self, minAC, maxAC, showMisses=False):

        # Set up X-axis, aka AC
        AC_axis = list(range(minAC, maxAC+1))
        data = {}
        for ac in AC_axis:
            data[ac] = self.simulate(ac)
        # Safety check that the damage ranges for each AC are the same
        size = len(data[minAC].keys())
        for row in data.values():
            assert len(row) == size, "Damage distribution dictionaries for each AC are not of same size"

        # Set up Y-axis, aka Damage
        damage_axis = list(data[minAC].keys())
        if not showMisses:
            damage_axis.remove(0)
        _xx, _yy = np.meshgrid(AC_axis, damage_axis)
        x_AC, y_Damage = _xx.ravel(), _yy.ravel()

        # Set up Z-axis, aka Probabilities
        z_Probabilities = []
        for i in range(len(x_AC)):
            z_Probabilities.append(data[x_AC[i]][y_Damage[i]])
        assert len(z_Probabilities) == len(x_AC), "Data processing error"

        # Set up the figure and axes
        fig = plt.figure(figsize=(12, 10))
        ax1 = fig.add_subplot(121, projection='3d')
        dx=dy=1
        z_floor=0
        ax1.bar3d(x_AC, y_Damage, z_floor, dx, dy, z_Probabilities, shade=True)
        ax1.set_title('Distribution of Damage Dealt per AC for \'' + self.name + '\'')

        plt.show()

    # Mega-method to display customizable analysis to the user
    def analyze(self, minAC, maxAC, graphs=False, testAC=15, showMisses=True):
        print("\n\n============================ANALYSIS BELOW======================================")
        print("Max damage: " + str(self.max_damage()))
        AC_range = range(minAC, maxAC+1)
        for AC in AC_range:
            avg = self.get_avg(AC)
            print("AC " + str(AC) + ": " + str(round(avg, 1)))

        if graphs.__class__.__name__ != 'bool':
            if 'AVG' in graphs or 'avg' in graphs:
                self.graph_avg_damage(minAC, maxAC)
            if 'CS' in graphs or 'cs' in graphs:
                self.graph_cross_section(testAC)
            if '3D' in graphs or '3d' in graphs:
                self.graph_3d(minAC, maxAC, showMisses)
            return 0

        if graphs:
            self.graph_avg_damage(minAC, maxAC)
            self.graph_cross_section(testAC)
            self.graph_3d(minAC, maxAC, showMisses)
