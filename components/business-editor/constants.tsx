"use client";
import React from "react";
import { Zap, Sparkles, Briefcase, Camera } from "lucide-react";

export const TAFANU_CATEGORIES: Record<string, string[]> = {
  Alimentacao: [
    "Hamburgueria",
    "Pizzaria",
    "Restaurante",
    "Bares",
    "Comida Japonesa",
    "Lanches",
    "Churrascaria",
    "Marmitex",
    "Comida Saudavel",
    "Acai",
    "Sorveteria",
    "Doceria",
    "Bolos",
    "Cafeteria",
    "Padaria",
    "Adega",
  ].sort(),

  Automotivo: [
    "Oficina Mecanica",
    "Auto Eletrica",
    "Ar Condicionado Automotivo",
    "Lava Rapido",
    "Estetica Automotiva",
    "Pneus",
    "Borracharia",
    "Centro Automotivo",
    "Som e Acessorios",
    "Auto Pecas",
    "Funilaria e Pintura",
    "Venda de Veiculos",
    "Oficina de Motos",
    "Guincho",
  ].sort(),

  Beleza: [
    "Salao de Beleza",
    "Barbearia",
    "Manicure",
    "Cilios",
    "Sobrancelha",
    "Clinica de Estetica",
    "Depilacao",
    "Massagem",
    "Podologia",
    "Tatuagem e Piercing",
    "Maquiagem",
  ].sort(),

  Comercio: [
    "Supermercado",
    "Acougue",
    "Hortifruti",
    "Material de Construcao",
    "Distribuidora de Bebidas",
    "Moda Feminina",
    "Moda Masculina",
    "Moda Infantil",
    "Calcados",
    "Loja de Celulares",
    "Assistencia de Celular",
    "Floricultura",
    "Papelaria",
    "Variedades e Utilidades",
    "Suplementos",
    "Moveis e Eletro",
  ].sort(),

  Educacao: [
    "Escola de Idiomas",
    "Autoescola",
    "Cursos Profissionalizantes",
    "Reforco Escolar",
    "Escola Particular",
    "Creche e Bercario",
    "Ensino Superior",
  ].sort(),

  Eventos: [
    "Buffet",
    "Espaco para Festas",
    "Decoracao de Festas",
    "Locacao de Brinquedos",
    "Doces e Salgados",
    "DJ e Som",
  ].sort(),

  Logistica: [
    "Fretes e Mudancas",
    "Motoboy e Entregas",
    "Transportadora",
    "Transporte Executivo",
    "Locadora de Veiculos",
  ].sort(),

  Pets: [
    "Pet Shop",
    "Clinica Veterinaria",
    "Banho e Tosa",
    "Casa de Racao",
    "Hospedagem Pet",
    "Adestramento",
  ].sort(),

  Profissionais: [
    "Advogado",
    "Contador",
    "Arquiteto",
    "Engenheiro",
    "Imobiliaria",
    "Fotografo",
    "Marketing",
    "Designer",
    "Corretor de Seguros",
    "Despachante",
  ].sort(),

  Saude: [
    "Clinica Medica",
    "Clinica Odontologica",
    "Psicologia",
    "Nutricao",
    "Fisioterapia",
    "Farmacia",
    "Otica",
    "Academia",
    "Pilates",
    "Laboratorio",
  ].sort(),

  Servicos: [
    "Eletricista",
    "Encanador",
    "Limpeza e Faxina",
    "Pintor",
    "Marceneiro",
    "Jardinagem",
    "Dedetizacao",
    "Ar Condicionado Residencial",
    "Vidracaria",
    "Marido de Aluguel",
    "Serralheria",
    "Assistencia Tecnica",
    "Chaveiro",
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
    placeholder: "Coleção Atual",
  },
};

export const contactPlaceholders: Record<string, string> = {
  instagram: "@seu.perfil",
  tiktok: "@seu.perfil",
  facebook: "facebook.com/suapagina",
  website: "www.seusite.com.br",
};
