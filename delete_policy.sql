-- Add DELETE policy for unlinking QR codes
CREATE POLICY "Anyone can delete items" ON items
  FOR DELETE
  USING (true);
