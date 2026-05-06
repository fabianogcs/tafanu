"use client";
import React from "react";
import { Zap, Sparkles, Briefcase, Camera } from "lucide-react";

export const TAFANU_CATEGORIES: Record<string, string[]> = {
  //  Ajustar sempre sem acentos e colocar no dicionario com acento quando for acrescentar algo
  // Ajustar sempre o lib/dicionary caso tenha acento
  Alimentacao: [
    "Hamburguer",
    "Pizza",
    "Japonesa",
    "Lanches",
    "Churrasco",
    "Marmita",
    "Comida Saudavel",
    "Acai",
    "Sorveteria",
    "Doces",
    "Bolos",
    "Cafeteria",
    "Padaria",
    "Bebidas",
    "Adega",
  ].sort(),

  Automotivo: [
    "Mecanico",
    "Auto Eletrica",
    "Ar Condicionado",
    "Lava Jato",
    "Estetica Automotiva",
    "Pneus",
    "Alinhamento",
    "Som Automotivo",
    "Auto Pecas",
    "Funilaria",
    "Venda de Veiculos",
  ].sort(),

  Beleza: [
    "Salao",
    "Barbearia",
    "Manicure",
    "Cilios",
    "Sobrancelha",
    "Estetica",
    "Depilacao",
    "Massagem",
    "Spa",
    "Maquiagem",
  ].sort(),

  Comercio: [
    "Supermercado",
    "Padaria",
    "Acougue",
    "Hortifruti",
    "Roupas Femininas",
    "Roupas Masculinas",
    "Calcados",
    "Eletronicos",
    "Celulares",
    "Floricultura",
    "Papelaria",
    "Presentes",
    "Suplementos",
  ].sort(),

  Pets: [
    "Pet Shop",
    "Veterinario",
    "Banho e Tosa",
    "Racao",
    "Hospedagem Pet",
    "Adestramento",
  ].sort(),

  Profissionais: [
    "Advogado",
    "Contador",
    "Chaveiro",
    "Arquiteto",
    "Engenheiro",
    "Imobiliaria",
    "Fotografo",
    "Marketing",
    "Designer",
    "DJ",
    "Seguros",
    "Professor Particular",
  ].sort(),

  Saude: [
    "Clinica",
    "Medico",
    "Dentista",
    "Psicologo",
    "Nutricionista",
    "Fisioterapia",
    "Farmacia",
    "Otica",
    "Academia",
    "Pilates",
  ].sort(),

  Servicos: [
    "Eletricista",
    "Encanador",
    "Diarista",
    "Faxina",
    "Pintor",
    "Marceneiro",
    "Jardinagem",
    "Dedetizacao",
    "Ar Condicionado",
    "Vidracaria",
    "Marido de Aluguel",
  ].sort(),
};

export const layoutInfo: any = {
  urban: {
    label: "Urban",
    icon: React.createElement(Zap, { size: 14 }),
    field: "urban_tag",
    placeholder: "@seu.estilo",
  },
  editorial: {
    label: "Luxe",
    icon: React.createElement(Sparkles, { size: 14 }),
    field: "luxe_quote",
    placeholder: "Frase elegante...",
  },
  businessList: {
    label: "Comercial",
    icon: React.createElement(Briefcase, { size: 14 }),
    field: "comercial_badge",
    placeholder: "Slogan Comercial",
  },
  showroom: {
    label: "Showroom",
    icon: React.createElement(Camera, { size: 14 }),
    field: "showroom_collection",
    placeholder: "Coleção 2026",
  },
};

export const contactPlaceholders: Record<string, string> = {
  instagram: "@seu.perfil",
  tiktok: "@seu.perfil",
  facebook: "facebook.com/suapagina",
  website: "www.seusite.com.br",
};
