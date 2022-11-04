
import math
from collections import namedtuple, Counter

Role = namedtuple('Role', 'name, ratio')

ROLES = [
  Role("Citizen", 0.5),
  Role("Werewolf", 0.3),
  Role("Spotter", 0.1),
  Role("Hunter", 0.1),
]

for player_count in range(-20, 41):
  ratio_total = sum(role.ratio for role in ROLES)
  scale_factor = player_count / ratio_total
  roles = []
  acc = 0
  for role in ROLES:
    count = math.ceil(role.ratio * scale_factor)
    acc += count
    for _ in range(count):
      roles.append(role.name)
  print(f"{acc - player_count}")
