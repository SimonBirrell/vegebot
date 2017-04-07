#!/usr/bin/env python

# -- from rosgraph --
from distutils.core import setup
from catkin_pkg.python_setup import generate_distutils_setup

setup_args = generate_distutils_setup(
    packages=['lettuce_prey'],
    package_dir={'': 'src/lettuce_prey'},
)

setup(**setup_args)
