#!/bin/bash

# Define the new dependency line
new_dependency='"@bot_cast/shared": "file:../shared"'

# Specify the path to your package.json file
package_json="./package.json"  # Adjust the path as needed

# Use sed to replace the old dependency with the new one
sed -i "s/\"@bot_cast\/shared\": \"[^\"]*\"/$new_dependency/" "$package_json"

echo "Updated package.json: Replaced old dependency with $new_dependency"
