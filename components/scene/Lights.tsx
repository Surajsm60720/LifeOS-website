// Intensities are recalibrated from the v1 build's values. v1 used
// three.js r128, whose point/spot lights had no inverse-square falloff
// applied by default; current three.js applies physically-correct
// falloff unconditionally, so the same numbers now read as dim/washed
// out (roughly a 4π ≈ 12.6x difference for point lights). Ambient and
// directional lights aren't affected by that falloff, so those keep
// close to their original values.
export function Lights() {
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight color={0xdfe4ec} intensity={1.6} position={[3, 5, 6]} />
      <pointLight color={0xf0876e} intensity={10} distance={26} position={[-5, -1.5, 4]} />
      <pointLight color={0x8cc8b4} intensity={5} distance={24} position={[5, 3, -3]} />
    </>
  );
}
