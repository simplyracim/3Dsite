// uvMapping.js

export function applyButtonUVMapping(geometry) {
    // Access the UV attribute
    const uvAttribute = geometry.attributes.uv;

    // Modify UV coordinates for each face
    // Front face (index 4 to 7)
    uvAttribute.setXY(4, 0.0, 0.0); // Bottom-left
    uvAttribute.setXY(5, 1.0, 0.0); // Bottom-right
    uvAttribute.setXY(6, 1.0, 1.0); // Top-right
    uvAttribute.setXY(7, 0.0, 1.0); // Top-left

    // Back face (index 0 to 3)
    uvAttribute.setXY(0, 0.0, 0.0); // Bottom-left
    uvAttribute.setXY(1, 1.0, 0.0); // Bottom-right
    uvAttribute.setXY(2, 1.0, 1.0); // Top-right
    uvAttribute.setXY(3, 0.0, 1.0); // Top-left

    // Right face (index 8 to 11)
    uvAttribute.setXY(8, 0.0, 0.0);
    uvAttribute.setXY(9, 1.0, 0.0);
    uvAttribute.setXY(10, 1.0, 1.0);
    uvAttribute.setXY(11, 0.0, 1.0);

    // Left face (index 12 to 15)
    uvAttribute.setXY(12, 0.0, 0.0);
    uvAttribute.setXY(13, 1.0, 0.0);
    uvAttribute.setXY(14, 1.0, 1.0);
    uvAttribute.setXY(15, 0.0, 1.0);

    // Top face (index 16 to 19)
    uvAttribute.setXY(16, 0.0, 0.0);
    uvAttribute.setXY(17, 1.0, 0.0);
    uvAttribute.setXY(18, 1.0, 1.0);
    uvAttribute.setXY(19, 0.0, 1.0);

    // Bottom face (index 20 to 23)
    uvAttribute.setXY(20, 0.0, 0.0);
    uvAttribute.setXY(21, 1.0, 0.0);
    uvAttribute.setXY(22, 1.0, 1.0);
    uvAttribute.setXY(23, 0.0, 1.0);
}