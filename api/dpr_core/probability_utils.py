from collections import defaultdict
import matplotlib.pyplot as plt

def add_dists(dist1, dist2):
    result = defaultdict(int)

    # Add a distribution and a constant
    if dist2.__class__.__name__ == 'int':
        return {key + dist2 : value for key, value in dist1.items()}
    # Add two distributions
    else:
        for j in dist1.keys():
            for k in dist2.keys():
                result[j+k] += dist1[j]*dist2[k]

    return result

def graph_dist(frequencies: dict[int:float], x_label: str):
    plt.bar(frequencies.keys(), [i*100 for i in frequencies.values()], color='#1f77b4', edgecolor='black')
    plt.xlabel(x_label)
    plt.ylabel('Percentage (%)')
    plt.title('Statistical Distribution of ' + x_label)
    plt.show()