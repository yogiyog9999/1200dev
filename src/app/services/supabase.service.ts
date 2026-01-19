// Fetch Contractor Profile
async getContractorProfile(userId: string) {
  const { data, error } = await this.client
    .from('contractors')
    .select('*')
    .eq('contractor_id', userId)
    .single();
  if (error) throw error;
  return data;
}

// Fetch Contractor Reviews
async getContractorReviews(userId: string) {
  const { data, error } = await this.client
    .from('reviews')
    .select('*, homeowners(*)')
    .eq('contractor_id', userId);
  if (error) throw error;
  return data;
}
