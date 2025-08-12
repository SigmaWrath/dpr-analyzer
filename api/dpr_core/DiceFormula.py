import re
from collections import defaultdict
from .Die import Die

class DiceFormula:

    def __init__(self, formula):
        self.formula = formula

        dice_dict = defaultdict(int)
        constant = 0
        terms = re.split('\+', self.formula)
        for term in terms:

            # Create a dictionary of {dice:num_rolls}
            if 'd' in term:
                coefficients = re.split('d', term.strip())
                if coefficients[0] == '':
                    dice_dict[int(coefficients[1])] += 1
                elif coefficients[0] == 'A' or coefficients[0] == 'D':
                    dice_dict[coefficients[0] + coefficients[1]] += 1
                else:
                    dice_dict[int(coefficients[1])] += int(coefficients[0])

            # Add up all the constant terms
            else:
                constant += int(term.strip())

        self.dice_dict = dice_dict
        self.constant = constant

    # Return the maximum value of the dice formula
    def max_roll(self):
        max_result = 0

        # Sum up the max rolls of each die
        for die in self.dice_dict.keys():
            # Account for dice with adv or dadv
            if die.__class__.__name__ != 'int':
                max_result += int(die[1:])*self.dice_dict[die]
            else:
                max_result += die*self.dice_dict[die]

        return max_result+self.constant

    # Return the average value of the dice formula
    def avg_roll(self):
        avg_result = 0

        # Sum up the average rolls of each die
        for die in self.dice_dict.keys():
            avg_result += Die(die).avg()*self.dice_dict[die]

        return avg_result+self.constant

    #TODO: frequencies()


    #TODO: probabilities()
    #TODO: graph()