import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Lock, Camera, Save, Loader2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import profileService, { UpdateProfileData, ChangePasswordData } from '../services/profileService';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: number;
    nome: string;
    email: string;
    telefone?: string;
    data_nascimento?: string;
    foto_perfil?: string;
  };
  onProfileUpdated: (updatedUser: any) => void;
  initialTab?: 'dados' | 'foto' | 'senha';
}

type Tab = 'dados' | 'foto' | 'senha';

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  user,
  onProfileUpdated,
  initialTab = 'dados',
}) => {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para dados pessoais
  const [profileData, setProfileData] = useState<UpdateProfileData>({
    nome: user.nome,
    email: user.email,
    telefone: user.telefone || '',
    data_nascimento: user.data_nascimento || '',
  });

  // Estados para senha
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    senhaAtual: '',
    novaSenha: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');

  // Estado para preview da foto
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens and set initial tab
      setProfileData({
        nome: user.nome,
        email: user.email,
        telefone: user.telefone || '',
        data_nascimento: user.data_nascimento || '',
      });
      setPasswordData({ senhaAtual: '', novaSenha: '' });
      setConfirmPassword('');
      setPhotoPreview(null);
      setSelectedFile(null);
      setActiveTab(initialTab); // Usar a aba inicial passada como prop
    }
  }, [isOpen, user, initialTab]);

  const handleProfileChange = (field: keyof UpdateProfileData, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: keyof ChangePasswordData, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo
    const typeValidation = profileService.validateImageType(file);
    if (!typeValidation.valid) {
      toast.error(typeValidation.message || 'Tipo de arquivo inválido');
      return;
    }

    // Validar tamanho
    const sizeValidation = profileService.validateImageSize(file);
    if (!sizeValidation.valid) {
      toast.error(sizeValidation.message || 'Arquivo muito grande');
      return;
    }

    setSelectedFile(file);

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadPhoto = async () => {
    if (!selectedFile) {
      toast.error('Selecione uma foto primeiro');
      return;
    }

    setUploadingPhoto(true);
    try {
      const result = await profileService.uploadProfilePhoto(selectedFile);
      toast.success('Foto de perfil atualizada com sucesso!');
      onProfileUpdated(result.user);
      setPhotoPreview(null);
      setSelectedFile(null);
    } catch (error: any) {
      console.error('Erro ao fazer upload da foto:', error);
      toast.error(error.response?.data?.message || 'Erro ao fazer upload da foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!profileData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (!profileData.email.trim()) {
      toast.error('Email é obrigatório');
      return;
    }

    if (profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      toast.error('Email inválido');
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await profileService.updateProfile(profileData);
      toast.success('Perfil atualizado com sucesso!');
      onProfileUpdated(updatedUser);
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error(error.response?.data?.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!passwordData.senhaAtual) {
      toast.error('Senha atual é obrigatória');
      return;
    }

    if (!passwordData.novaSenha) {
      toast.error('Nova senha é obrigatória');
      return;
    }

    if (passwordData.novaSenha.length < 6) {
      toast.error('Nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (passwordData.novaSenha !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      await profileService.changePassword(passwordData);
      toast.success('Senha alterada com sucesso!');
      setPasswordData({ senhaAtual: '', novaSenha: '' });
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      toast.error(error.response?.data?.message || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Editar Perfil</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex">
              <button
                onClick={() => setActiveTab('dados')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'dados'
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <User className="inline-block mr-2" size={18} />
                Dados Pessoais
              </button>
              <button
                onClick={() => setActiveTab('foto')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'foto'
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Camera className="inline-block mr-2" size={18} />
                Foto de Perfil
              </button>
              <button
                onClick={() => setActiveTab('senha')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'senha'
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Lock className="inline-block mr-2" size={18} />
                Alterar Senha
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            {/* Aba Dados Pessoais */}
            {activeTab === 'dados' && (
              <form onSubmit={handleUpdateProfile}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={profileData.nome}
                      onChange={(e) => handleProfileChange('nome', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={profileData.telefone}
                      onChange={(e) => handleProfileChange('telefone', e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      value={profileData.data_nascimento}
                      onChange={(e) => handleProfileChange('data_nascimento', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={20} />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2" size={20} />
                          Salvar Alterações
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Aba Foto de Perfil */}
            {activeTab === 'foto' && (
              <div className="space-y-6">
                <div className="flex flex-col items-center">
                  {/* Preview da foto */}
                  <div className="mb-6">
                    <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                      {photoPreview || user.foto_perfil ? (
                        <img
                          src={photoPreview || profileService.getPhotoUrl(user.foto_perfil)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={80} className="text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Input de arquivo escondido */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Botões */}
                  <div className="flex gap-3 w-full">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
                    >
                      <Upload className="mr-2" size={20} />
                      Escolher Foto
                    </button>

                    {selectedFile && (
                      <button
                        type="button"
                        onClick={handleUploadPhoto}
                        disabled={uploadingPhoto}
                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploadingPhoto ? (
                          <>
                            <Loader2 className="animate-spin mr-2" size={20} />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2" size={20} />
                            Salvar Foto
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 mt-4 text-center">
                    Formatos aceitos: JPG, PNG, GIF, WebP
                    <br />
                    Tamanho máximo: 5MB
                  </p>
                </div>
              </div>
            )}

            {/* Aba Alterar Senha */}
            {activeTab === 'senha' && (
              <form onSubmit={handleChangePassword}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Senha Atual *
                    </label>
                    <input
                      type="password"
                      value={passwordData.senhaAtual}
                      onChange={(e) => handlePasswordChange('senhaAtual', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nova Senha *
                    </label>
                    <input
                      type="password"
                      value={passwordData.novaSenha}
                      onChange={(e) => handlePasswordChange('novaSenha', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Mínimo de 6 caracteres</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar Nova Senha *
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={20} />
                          Alterando...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2" size={20} />
                          Alterar Senha
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProfileEditModal;
