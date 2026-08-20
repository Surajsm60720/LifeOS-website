export function Lights() {
  return (
    <>
      <ambientLight intensity={0.62} />
      <directionalLight color={0xdfe4ec} intensity={1.05} position={[3, 5, 6]} />
      <pointLight color={0xf0876e} intensity={0.95} distance={26} position={[-5, -1.5, 4]} />
      <pointLight color={0x8cc8b4} intensity={0.42} distance={24} position={[5, 3, -3]} />
    </>
  );
}
